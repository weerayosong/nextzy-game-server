import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';

// สร้าง Prisma Client แยกเฉพาะสำหรับการรัน Script
const prisma = new PrismaClient();
const BATCH_SIZE = 10000; // ส่งข้อมูลเข้า Database ทีละ 10,000 แถว

// ฟังก์ชันช่วยเหลือสำหรับอ่านไฟล์และจัดการส่งทีละ Batch
// 1. แก้ไขให้ใช้ Generic Type <T> แทนการใช้ any เพื่อความปลอดภัยของ Type
async function processCSV<T>(
  filePath: string,
  mapRow: (line: string) => T | null,
  insertBatch: (batch: T[]) => Promise<void>,
) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let batch: T[] = [];
  let isFirstLine = true;
  let totalInserted = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    } // ข้ามบรรทัดหัวตาราง

    const data = mapRow(line);
    if (data) {
      batch.push(data);
    }

    // เมื่อครบ 10,000 แถว ให้ส่งเข้า Database 1 ครั้ง
    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch);
      totalInserted += batch.length;
      console.log(`... Inserted ${totalInserted.toLocaleString()} records`);
      batch = []; // เคลียร์ของเก่า เตรียมรับรอบใหม่
    }
  }

  // ส่งเศษที่เหลือ (ถ้ามี)
  if (batch.length > 0) {
    await insertBatch(batch);
    totalInserted += batch.length;
    console.log(`... Inserted ${totalInserted.toLocaleString()} records`);
  }
}

async function runSeeder() {
  try {
    console.log('🚀 [1/2] กำลังนำเข้าข้อมูล ผู้เล่น (Users)...');
    await processCSV(
      'data/users_clean.csv', // data folder
      (line) => {
        const [id, nickname, totalPoints] = line.split(',');
        if (!id || !nickname) return null;
        return { id, nickname, totalPoints: parseInt(totalPoints, 10) };
      },
      async (batch) => {
        // ใช้ createMany เพื่อความเร็วสูงสุด และข้ามอันที่ซ้ำ (skipDuplicates)
        await prisma.user.createMany({ data: batch, skipDuplicates: true });
      },
    );
    console.log('✅ นำเข้า ผู้เล่น เสร็จสมบูรณ์!\n');

    console.log('🚀 [2/2] กำลังนำเข้าข้อมูล ประวัติการหมุน (Spin History)...');
    await processCSV(
      'data/history_clean.csv', // data folder
      (line) => {
        const [userId, pointsReceived, createdAt] = line.split(',');
        if (!userId || !pointsReceived) return null;
        return {
          userId,
          pointsReceived: parseInt(pointsReceived, 10),
          createdAt: new Date(createdAt),
        };
      },
      async (batch) => {
        await prisma.spinHistory.createMany({
          data: batch,
          skipDuplicates: true,
        });
      },
    );
    console.log('✅ นำเข้า ประวัติการหมุน เสร็จสมบูรณ์!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    // ปิดการเชื่อมต่อเมื่อทำงานเสร็จ
    await prisma.$disconnect();
  }
}

// 2. จัดการ Promise ตามกฎโดยการเพิ่ม .catch() ดักไว้
runSeeder().catch((err) => {
  console.error('Unhandled error during seeding:', err);
});
