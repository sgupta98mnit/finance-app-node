import { Injectable, NotFoundException } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  private readonly kafka = new Kafka({
    clientId: 'account-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });

  private readonly producer = this.kafka.producer();

  constructor(private readonly prisma: PrismaService) {}

  async createAccount(dto: CreateAccountDto) {
    const account = await this.prisma.account.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        currency: dto.currency,
        balance: {
          create: {
            amount: 0
          }
        }
      },
      include: {
        balance: true
      }
    });

    await this.emitAccountCreated(account);
    return account;
  }

  async getAccount(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { balance: true }
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async getBalance(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: { balance: true }
    });
    if (!account || !account.balance) {
      throw new NotFoundException('Account not found');
    }
    return { accountId: account.id, amount: account.balance.amount.toString(), currency: account.currency };
  }

  private async emitAccountCreated(account: {
    id: string;
    userId: string;
    type: string;
    currency: string;
    status: string;
    createdAt: Date;
  }) {
    await this.producer.connect();
    await this.producer.send({
      topic: 'account.created.v1',
      messages: [
        {
          key: account.id,
          value: JSON.stringify({
            id: account.id,
            userId: account.userId,
            type: account.type,
            currency: account.currency,
            status: account.status,
            createdAt: account.createdAt.toISOString()
          })
        }
      ]
    });
    await this.producer.disconnect();
  }
}
