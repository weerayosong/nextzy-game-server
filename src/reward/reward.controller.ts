import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
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
}
