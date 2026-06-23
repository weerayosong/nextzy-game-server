import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

// 1. สร้าง Mock Prisma ที่ใส่ยันต์กัน ESLint ไว้เรียบร้อยแล้ว
const mockPrismaService = {
  user: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findUnique: jest.fn((..._args: unknown[]) =>
      Promise.resolve<unknown>(null),
    ),
  },
  rewardClaim: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findUnique: jest.fn((..._args: unknown[]) =>
      Promise.resolve<unknown>(null),
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    create: jest.fn((..._args: unknown[]) => Promise.resolve<unknown>({})),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findMany: jest.fn((..._args: unknown[]) => Promise.resolve<unknown>([])),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    count: jest.fn((..._args: unknown[]) => Promise.resolve<unknown>(0)),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $transaction: jest.fn((..._args: unknown[]) => Promise.resolve<unknown>([])),
};

describe('RewardService', () => {
  let service: RewardService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as unknown as typeof mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ควรสร้าง RewardService ได้สำเร็จ (Smoke Test)', () => {
    expect(service).toBeDefined();
  });

  // =================================================================
  // เทสระบบรับรางวัล (ด่านตรวจ 3 ชั้น)
  // =================================================================
  describe('claimReward()', () => {
    it('ด่านที่ 1: ควรโยน NotFoundException ถ้าไม่พบ User', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.claimReward('ghost-id', 500)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ด่านที่ 2: ควรโยน BadRequestException ถ้าคะแนนไม่ถึงเกณฑ์', async () => {
      // จำลองให้ User มีคะแนนแค่ 300 แต่พยายามมารับรางวัล Checkpoint 500
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totalPoints: 300,
      });
      await expect(service.claimReward('user-1', 500)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('ด่านที่ 3: ควรโยน BadRequestException ถ้ารับรางวัล Checkpoint นี้ไปแล้ว', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totalPoints: 1000,
      }); // แต้มถึง
      prisma.rewardClaim.findUnique.mockResolvedValue({ id: 'claim-1' }); // แต่ดันเคยรับไปแล้ว

      await expect(service.claimReward('user-1', 500)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.rewardClaim.create).not.toHaveBeenCalled(); // ต้องไม่มีการบันทึกซ้ำ
    });

    it('Happy Path: ควรรับรางวัลสำเร็จ ถ้าผ่านเงื่อนไขครบถ้วน', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        totalPoints: 1000,
      }); // แต้มถึง
      prisma.rewardClaim.findUnique.mockResolvedValue(null); // ไม่เคยรับมาก่อน
      prisma.rewardClaim.create.mockResolvedValue({
        id: 'new-claim',
        checkpoint: 500,
      }); // จำลองการบันทึกสำเร็จ

      const result = await service.claimReward('user-1', 500);

      expect(result.message).toContain('Successfully claimed');
      expect(prisma.rewardClaim.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', checkpoint: 500 },
      });
    });
  });

  // =================================================================
  // เทสระบบดึงประวัติการรับรางวัล (ทดสอบ Pagination)
  // =================================================================
  describe('getRewardHistory()', () => {
    it('ควรดึงข้อมูลประวัติและคำนวณจำนวนหน้า (Pagination) ได้ถูกต้อง', async () => {
      const mockData = [
        { id: '1', checkpoint: 500 },
        { id: '2', checkpoint: 1000 },
      ];
      const mockTotal = 2;

      // จำลองผลลัพธ์ของ $transaction ที่คืนค่าเป็น Array [ข้อมูล, จำนวนทั้งหมด]
      prisma.$transaction.mockResolvedValue([mockData, mockTotal]);

      const result = await service.getRewardHistory('user-1', 1, 10);

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(mockTotal);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1); // มี 2 ไอเท็ม แสดงหน้าละ 10 = ต้องมี 1 หน้า
    });
  });
});
