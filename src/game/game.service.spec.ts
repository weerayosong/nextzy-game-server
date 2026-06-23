import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

// 1. เปลี่ยนมาใช้ (..._args: unknown[]) เพื่อให้รองรับพารามิเตอร์กี่ตัวก็ได้
const mockPrismaService = {
  user: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findUnique: jest.fn((..._args: unknown[]) =>
      Promise.resolve<unknown>(null),
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update: jest.fn((..._args: unknown[]) => Promise.resolve<unknown>({})),
  },
  spinHistory: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    create: jest.fn((..._args: unknown[]) => Promise.resolve<unknown>({})),
  },
  $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) =>
    cb(mockPrismaService),
  ),
};

describe('GameService', () => {
  let service: GameService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as unknown as typeof mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ควรสร้าง GameService ได้สำเร็จ (Smoke Test)', () => {
    expect(service).toBeDefined();
  });

  describe('spin()', () => {
    it('ควรโยน NotFoundException ถ้าไม่พบ User ในระบบ', async () => {
      const mockUserId = 'invalid-user-id';

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.spin(mockUserId)).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('ควรสุ่มคะแนนและอัปเดตข้อมูลสำเร็จ ถ้ามี User อยู่จริง', async () => {
      const mockUserId = 'valid-user-id';
      const mockUser = { id: mockUserId, totalPoints: 1000 };
      const expectedPointsList = [300, 500, 1000, 3000];

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, totalPoints: 1500 });
      prisma.spinHistory.create.mockResolvedValue({ id: 'history-1' });

      const result = await service.spin(mockUserId);

      expect(result).toBeDefined();
      expect(expectedPointsList).toContain(result.rewardPoints);
      expect(prisma.$transaction).toHaveBeenCalled();

      // 2. คราวนี้ toHaveBeenCalledWith จะไม่ฟ้อง error แล้วครับ เพราะข้างบนเรารับ (..._args) ไว้แล้ว
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          totalPoints: {
            increment: result.rewardPoints, // ลบเครื่องหมาย ? ออก เพราะเราชัวร์ว่าผลลัพธ์มีค่าแน่นอน
          },
        },
      });
    });
  });
});
