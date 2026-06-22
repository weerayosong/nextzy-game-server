import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { RewardModule } from './reward/reward.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GameModule,
    RewardModule,
    HistoryModule,
    ThrottlerModule.forRoot([
      // 100 requests/1min
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // ผูก ThrottlerGuard ให้ทำงานครอบคลุมทั้งแอป
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
