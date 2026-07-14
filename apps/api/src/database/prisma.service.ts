import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * The application's database client. Connects as the restricted `skelly_app` role
 * (via DATABASE_URL) and is therefore subject to Row-Level Security — tenant scoping
 * is applied through `withOrg` (see ./tenant).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
