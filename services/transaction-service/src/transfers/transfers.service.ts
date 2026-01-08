import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class TransfersService {
  private readonly kafka = new Kafka({
    clientId: 'transaction-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });

  private readonly producer = this.kafka.producer();
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  constructor(private readonly prisma: PrismaService) {}

  async createTransfer(dto: CreateTransferDto, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const idempotencyLookupKey = `transfer:${idempotencyKey}`;
    const existingTransferId = await this.redis.get(idempotencyLookupKey);
    if (existingTransferId) {
      const transfer = await this.prisma.transfer.findUnique({
        where: { id: existingTransferId }
      });
      if (transfer) {
        return transfer;
      }
    }

    const transfer = await this.prisma.transfer.create({
      data: {
        fromAccountId: dto.fromAccountId,
        toAccountId: dto.toAccountId,
        amount: dto.amount,
        currency: dto.currency
      }
    });

    await this.redis.set(idempotencyLookupKey, transfer.id, 'EX', IDEMPOTENCY_TTL_SECONDS);

    const payload = {
      id: transfer.id,
      fromAccountId: transfer.fromAccountId,
      toAccountId: transfer.toAccountId,
      amount: transfer.amount.toString(),
      currency: transfer.currency,
      status: transfer.status,
      createdAt: transfer.createdAt.toISOString()
    };

    const outbox = await this.prisma.outboxEvent.create({
      data: {
        aggregateId: transfer.id,
        topic: 'transfer.requested.v1',
        payload
      }
    });

    await this.publishOutbox(outbox.id, transfer.id, payload);

    return transfer;
  }

  async getTransfer(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    return transfer;
  }

  private async publishOutbox(outboxId: string, aggregateId: string, payload: Record<string, unknown>) {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: 'transfer.requested.v1',
        messages: [
          {
            key: aggregateId,
            value: JSON.stringify(payload)
          }
        ]
      });
      await this.prisma.outboxEvent.update({
        where: { id: outboxId },
        data: { status: 'SENT', sentAt: new Date() }
      });
    } catch {
      await this.prisma.outboxEvent.update({
        where: { id: outboxId },
        data: { status: 'FAILED' }
      });
    } finally {
      await this.producer.disconnect();
    }
  }
}
