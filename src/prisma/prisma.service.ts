import { Injectable, OnModuleInit, OnModuleDestroy, Global } from '@nestjs/common';
import { prisma } from 'src/libs/db/client';

@Global()
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {

  $connect = prisma.$connect.bind(prisma);
  $disconnect = prisma.$disconnect.bind(prisma);
  $transaction = prisma.$transaction.bind(prisma);
  [key: string]: any;

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}