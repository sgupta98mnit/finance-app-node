import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRulesDto } from './dto/update-rules.dto';
import { BlacklistDto } from './dto/blacklist.dto';

const DEFAULT_RULE_ID = 'default';

@Injectable()
export class FraudService implements OnModuleInit {
  private readonly logger = new Logger(FraudService.name);
  private readonly kafka = new Kafka({
    clientId: 'fraud-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
  });
  private readonly consumer = this.kafka.consumer({ groupId: 'fraud-service' });
  private readonly producer = this.kafka.producer();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'transfer.requested.v1', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }
        const payload = JSON.parse(message.value.toString()) as {
          id: string;
          fromAccountId: string;
          toAccountId: string;
          amount: string;
          currency: string;
        };

        const result = await this.evaluateTransfer(payload.id, payload.fromAccountId, payload.amount, payload.currency);
        await this.publishFraudChecked(payload.id, payload.fromAccountId, payload.toAccountId, payload.amount, payload.currency, result.approved, result.reasons);
      }
    });
  }

  async getRules() {
    return this.prisma.fraudRule.upsert({
      where: { id: DEFAULT_RULE_ID },
      create: { id: DEFAULT_RULE_ID },
      update: {}
    });
  }

  async updateRules(dto: UpdateRulesDto) {
    return this.prisma.fraudRule.upsert({
      where: { id: DEFAULT_RULE_ID },
      create: {
        id: DEFAULT_RULE_ID,
        maxDailyAmount: dto.maxDailyAmount ?? 10000,
        maxTransfersPerMinute: dto.maxTransfersPerMinute ?? 10,
        maxBurstCount: dto.maxBurstCount ?? 5,
        burstWindowMinutes: dto.burstWindowMinutes ?? 2
      },
      update: {
        maxDailyAmount: dto.maxDailyAmount,
        maxTransfersPerMinute: dto.maxTransfersPerMinute,
        maxBurstCount: dto.maxBurstCount,
        burstWindowMinutes: dto.burstWindowMinutes
      }
    });
  }

  async addToBlacklist(dto: BlacklistDto) {
    return this.prisma.blacklistedSubject.upsert({
      where: { subjectId: dto.subjectId },
      create: {
        subjectId: dto.subjectId,
        reason: dto.reason
      },
      update: {
        reason: dto.reason
      }
    });
  }

  async removeFromBlacklist(subjectId: string) {
    return this.prisma.blacklistedSubject.delete({ where: { subjectId } });
  }

  private async evaluateTransfer(transferId: string, subjectId: string, amount: string, currency: string) {
    const rules = await this.getRules();
    const reasons: string[] = [];

    const isBlacklisted = await this.prisma.blacklistedSubject.findUnique({
      where: { subjectId }
    });
    if (isBlacklisted) {
      reasons.push('blacklisted');
    }

    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dailySum = await this.prisma.fraudCheckRecord.aggregate({
      where: {
        subjectId,
        createdAt: {
          gte: startOfDay
        }
      },
      _sum: {
        amount: true
      }
    });

    const dailyAmount = Number(dailySum._sum.amount ?? 0) + Number(amount);
    if (dailyAmount > Number(rules.maxDailyAmount)) {
      reasons.push('max_daily_amount');
    }

    const windowStart = new Date(Date.now() - rules.burstWindowMinutes * 60 * 1000);
    const burstCount = await this.prisma.fraudCheckRecord.count({
      where: {
        subjectId,
        createdAt: {
          gte: windowStart
        }
      }
    });
    if (burstCount + 1 > rules.maxBurstCount) {
      reasons.push('burst_limit');
    }

    const minuteWindowStart = new Date(Date.now() - 60 * 1000);
    const velocityCount = await this.prisma.fraudCheckRecord.count({
      where: {
        subjectId,
        createdAt: {
          gte: minuteWindowStart
        }
      }
    });
    if (velocityCount + 1 > rules.maxTransfersPerMinute) {
      reasons.push('velocity');
    }

    const approved = reasons.length === 0;

    await this.prisma.fraudCheckRecord.create({
      data: {
        transferId,
        subjectId,
        amount,
        currency,
        approved,
        reasons
      }
    });

    return { approved, reasons };
  }

  private async publishFraudChecked(
    transferId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: string,
    currency: string,
    approved: boolean,
    reasons: string[]
  ) {
    await this.producer.connect();
    await this.producer.send({
      topic: 'transfer.fraud_checked.v1',
      messages: [
        {
          key: transferId,
          value: JSON.stringify({
            id: transferId,
            fromAccountId,
            toAccountId,
            amount,
            currency,
            approved,
            reasons
          })
        }
      ]
    });
    await this.producer.disconnect();
  }
}
