import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly kafka = new Kafka({
    clientId: 'notification-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });
  private readonly consumer = this.kafka.consumer({ groupId: 'notification-service' });

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'notification.requested.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'transfer.fraud_checked.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'transfer.completed.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'transfer.failed.v1', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          return;
        }
        const payload = JSON.parse(message.value.toString());
        await this.logNotification(topic, payload);
        this.logger.log(`Mock send for ${topic}: ${JSON.stringify(payload)}`);
      }
    });
  }

  async listLogs(limit = 50) {
    const logs = await this.prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return logs.map((log) => ({
      id: log.id,
      type: log.type,
      status: log.status,
      payload: log.payload,
      createdAt: log.createdAt.toISOString()
    }));
  }

  private async logNotification(type: string, payload: unknown) {
    await this.prisma.notificationLog.create({
      data: {
        type,
        status: 'SENT',
        payload
      }
    });
  }
}
