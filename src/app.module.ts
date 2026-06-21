import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { RewardModule } from './reward/reward.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [PrismaModule, AuthModule, GameModule, RewardModule, HistoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
