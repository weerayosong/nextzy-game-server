import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getUserHistory(userId: string) {
    // 1. ตรวจผู้เล่นและดึงคะแนนรวม
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, totalPoints: true }, // เลือกดึงมาเฉพาะฟิลด์ที่จำเป็น
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. ดึงประวัติการหมุนวงล้อ desc-เรียงจากใหม่ไปเก่า และจำกัดแค่ 50 รายการล่าสุดเพื่อลดภาระเซิร์ฟเวอร์
    const spinHistory = await this.prisma.spinHistory.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 3. ดึงประวัติการรับรางวัล desc-เรียงจากใหม่ไปเก่า
    const rewardClaims = await this.prisma.rewardClaim.findMany({
      where: { userId: userId },
      orderBy: { claimedAt: 'desc' },
    });

    // 4. ส่งข้อมูลทั้งหมดกลับไปเป็นก้อนเดียว
    return {
      user,
      spinHistory,
      rewardClaims,
    };
  }
}
