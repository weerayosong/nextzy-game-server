import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  // ดึงประวัติแบบรวมของทุกคน (โชว์ชื่อคนเล่นด้วย)
  async getGlobalHistory(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.spinHistory.findMany({
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { nickname: true }, // ดึงมาแค่ชื่อ จะได้ไม่ส่งข้อมูลอื่นหลุดไป
          },
        },
      }),
      this.prisma.spinHistory.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages },
    };
  }

  // ดึงประวัติเฉพาะของ User คนนั้น
  async getPersonalHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.spinHistory.findMany({
        where: { userId: userId },
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.spinHistory.count({
        where: { userId: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages },
    };
  }
}
