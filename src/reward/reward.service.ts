import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardService {
  constructor(private prisma: PrismaService) {}

  async claimReward(userId: string, checkpoint: number) {
    // 1. ดึงข้อมูลผู้เล่นมาตรวจ
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. ตรวจว่าคะแนนรวมถึงเกณฑ์ยัง
    if (user.totalPoints < checkpoint) {
      throw new BadRequestException(
        `Not enough points. You need at least ${checkpoint} points.`,
      );
    }

    // 3. ตรวจสอบว่าคนนี้เคยรับรางวัลของ checkpoint นี้แล้วยัง
    // (อ้างอิงจาก @@unique([userId, checkpoint]) ที่ทำไว้ใน Schema)
    const existingClaim = await this.prisma.rewardClaim.findUnique({
      where: {
        userId_checkpoint: {
          userId: userId,
          checkpoint: checkpoint,
        },
      },
    });

    if (existingClaim) {
      throw new BadRequestException(
        `Reward for checkpoint ${checkpoint} has already been claimed.`,
      );
    }

    // 4. บันทึกประวัติการรับรางวัลลงฐานข้อมูล
    const claim = await this.prisma.rewardClaim.create({
      data: {
        userId: userId,
        checkpoint: checkpoint,
      },
    });

    return {
      message: `Successfully claimed reward for checkpoint ${checkpoint}!`,
      claim,
    };
  }
}
