import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async spin(userId: string) {
    // 1. ตรวจสอบว่าผู้เล่นมีตัวตนมั้ย
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. เทสสุ่มคะแนน (eg. 10, 20, 50, 100)
    const pointsList = [300, 500, 1000, 3000];
    const rewardPoints =
      pointsList[Math.floor(Math.random() * pointsList.length)];

    // 3. ใช้ Transaction เพื่อจัดการข้อมูล 2 ตารางพร้อมกัน
    const result = await this.prisma.$transaction(async (tx) => {
      // 3.1 เพิ่มคะแนนรวมให้ผู้เล่น
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: rewardPoints,
          },
        },
      });

      // 3.2 บันทึกประวัติการหมุนวงล้อ
      const history = await tx.spinHistory.create({
        data: {
          userId: userId,
          pointsReceived: rewardPoints,
        },
      });

      return { totalPoints: updatedUser.totalPoints, history };
    });

    // 4. ส่งผลลัพธ์กลับไปให้ Frontend
    return {
      message: 'Spin successful!',
      rewardPoints: rewardPoints,
      currentTotalPoints: result.totalPoints,
    };
  }
}
