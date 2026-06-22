import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { RewardService } from './reward.service';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post('claim')
  async claimReward(
    @Body('userId') userId: string,
    @Body('checkpoint') checkpoint: number,
  ) {
    if (!userId || checkpoint === undefined) {
      throw new BadRequestException('userId and checkpoint are required');
    }
    return this.rewardService.claimReward(userId, checkpoint);
  }

  // ดึงประวัติการรับรางวัล
  @Get('history/:userId')
  async getRewardHistory(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.rewardService.getRewardHistory(
      userId,
      Number(page),
      Number(limit),
    );
  }
}
