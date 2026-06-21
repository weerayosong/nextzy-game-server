import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  // เรียกใช้งาน Prisma ที่ทำเป็น Global Module ไว้
  constructor(private prisma: PrismaService) {}

  async login(nickname: string) {
    // 1. ค้นหาผู้เล่นจากชื่อในฐานข้อมูล
    let user = await this.prisma.user.findUnique({
      where: { nickname },
    });

    // 2. ถ้าไม่พบชื่อนี้ ให้สร้างผู้เล่นใหม่ (เหมือนสมัครสมาชิกอัตโนมัติ)
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          nickname,
          totalPoints: 0,
        },
      });
    }

    // 3. ส่งข้อมูลผู้เล่นกลับไป
    return user;
  }
}
