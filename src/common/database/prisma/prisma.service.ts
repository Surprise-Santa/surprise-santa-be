import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}