import * as fs from 'fs';
import * as readline from 'readline';
import * as crypto from 'crypto';

const INPUT_FILE = 'mock_data.csv'; // at root dir
const USERS_OUTPUT_FILE = 'users_clean.csv';
const HISTORY_OUTPUT_FILE = 'history_clean.csv';

async function run() {
  console.log(
    '⏳ [Step 1/2] กำลังอ่านไฟล์เพื่อคัดแยกผู้เล่นและคำนวณคะแนนรวม...',
  );

  // ใช้ Map เพื่อเก็บรายชื่อผู้เล่นที่ไม่ซ้ำกัน พร้อมรหัส UUID และคะแนนรวม
  const userMap = new Map<string, { id: string; totalPoints: number }>();

  // อ่านไฟล์รอบที่ 1
  const fileStream = fs.createReadStream(INPUT_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isFirstLine = true;
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    } // ข้ามบรรทัดหัวตาราง (Header)

    // ตัดข้อความด้วยลูกน้ำ (Comma)
    const [nickname, pointStr] = line.split(',');
    if (!nickname) continue;

    const point = parseInt(pointStr, 10) || 0;

    // ถ้ายังไม่เคยเจอชื่อนี้ ให้สร้าง UUID ให้ใหม่
    if (!userMap.has(nickname)) {
      userMap.set(nickname, { id: crypto.randomUUID(), totalPoints: 0 });
    }

    // นำคะแนนมาบวกสะสมเป็น totalPoints
    userMap.get(nickname)!.totalPoints += point;
  }

  console.log(`✅ พบผู้เล่นที่ไม่ซ้ำกัน ${userMap.size.toLocaleString()} คน`);
  console.log(`⏳ กำลังสร้างไฟล์ ${USERS_OUTPUT_FILE}...`);

  // สร้างไฟล์ Users สำหรับ Import
  const userStream = fs.createWriteStream(USERS_OUTPUT_FILE);
  userStream.write('id,nickname,totalPoints\n'); // Header ของตาราง User
  for (const [nickname, data] of userMap.entries()) {
    userStream.write(`${data.id},${nickname},${data.totalPoints}\n`);
  }
  userStream.end();

  console.log('\n⏳ [Step 2/2] กำลังจับคู่ประวัติการหมุนวงล้อกับรหัส UUID...');

  // สร้างไฟล์ History สำหรับ Import
  const historyStream = fs.createWriteStream(HISTORY_OUTPUT_FILE);
  historyStream.write('userId,pointsReceived,createdAt\n'); // Header ของตาราง SpinHistory

  // อ่านไฟล์รอบที่ 2
  const fileStream2 = fs.createReadStream(INPUT_FILE);
  const rl2 = readline.createInterface({
    input: fileStream2,
    crlfDelay: Infinity,
  });

  isFirstLine = true;
  let historyCount = 0;
  for await (const line of rl2) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    const [nickname, pointStr, datetime] = line.split(',');
    if (!nickname) continue;

    // ค้นหา UUID ของคนๆ นี้จากที่บันทึกไว้ใน Map
    const userId = userMap.get(nickname)!.id;

    // เขียนข้อมูลลงไฟล์ History (เปลี่ยน nickname เป็น userId)
    historyStream.write(`${userId},${pointStr},${datetime}\n`);
    historyCount++;
  }
  historyStream.end();

  console.log(
    `✅ สร้างประวัติเสร็จสิ้น ${historyCount.toLocaleString()} รายการ ไปที่ไฟล์ ${HISTORY_OUTPUT_FILE}`,
  );
  console.log('🎉 [ETL เสร็จสมบูรณ์] พร้อมนำข้อมูลเข้า Database');
}

run().catch(console.error);
