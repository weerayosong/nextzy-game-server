# Nextzy Gamification - Backend (Server)

ระบบส่วนหลังบ้าน (Backend) สำหรับโปรเจกต์ Nextzy Gamification พัฒนาด้วย NestJS และ Prisma ORM โดยมุ่งเน้นที่ความปลอดภัยของข้อมูลและรองรับการขยายตัว

![ss](https://github.com/weerayosong/weerayosong.github.io/blob/main/images/gif/proj9b.gif?raw=true)

Repository ฝั่ง Frontend (Next.js): [Link to Frontend Repository](https://github.com/weerayosong/nextzy-game-client)  
API Documentation (API Dog): [Link to API Documentation](https://7wzm0we8ze.apidog.io)  
Live Preview Link: [Link to Live Preview](https://nextzy-game-client.vercel.app/)

## การออกแบบระบบและสถาปัตยกรรม (System Design & Software Architecture)

[Link to Documentation](https://incandescent-crumble-d59b5c.netlify.app)

โปรเจกต์นี้ออกแบบโครงสร้างตามมาตรฐานของ NestJS และ Clean Architecture:

- **Modular Structure:** โค้ดถูกแบ่งออกเป็นโมดูลที่มีหน้าที่เฉพาะเจาะจงอย่างชัดเจน (Auth, Game, Reward, History) ตามหลัก Single Responsibility Principle
- **High-Volume Data Handling (ETL):** พัฒนาสคริปต์พิเศษด้วย Prisma เพื่อทำกระบวนการ ETL (Extract, Transform, Load) ข้อมูลประวัติการเล่นจำนวนกว่า 2,000,000 แถว โดยใช้เทคนิค Chunking แบ่งยิงข้อมูลเข้าฐานข้อมูลทีละ 10,000 แถว เพื่อป้องกันปัญหา Memory Overhead และ Database Timeout
- **Data Integrity:** ควบคุมความถูกต้องของข้อมูลด้วย Database Constraints ระดับ Schema (เช่น `@@unique([userId, checkpoint])`) เพื่อป้องกัน Race Condition
- **Performance Strategy:** ลดภาระการคำนวณของเซิร์ฟเวอร์ด้วยการทำ Denormalization โดยคำนวณและเก็บผลรวมคะแนนไว้ที่ตาราง User โดยตรง
- **Global Error Pipeline:** จัดการ Error อย่างเป็นระบบ โดยหลังบ้านใช้ Exception Filters (NestJS) คืนค่า HTTP Status ที่ถูกต้อง ทำงานสอดคล้องกับส่วนหน้าบ้านที่ดักจับด้วย Try-Catch และแสดงผลผ่าน UI Toast ที่เป็นมิตรกับผู้ใช้

## ฟีเจอร์หลัก (Core Features)

- **Authentication System:** ระบบเข้าสู่ระบบด้วย Nickname พร้อมสร้างและระบุตัวตนผู้เล่นด้วย UUID
- **Gamification Engine:** ระบบประมวลผลการสุ่มวงล้อ (Spin) คำนวณคะแนนรางวัล และอัปเดตคะแนนสะสมของผู้เล่นแบบเรียลไทม์
- **Milestone Reward System:** ระบบกดรับรางวัลตามขั้นบันได (Checkpoints) ที่กำหนด
- **Anti-Cheat Validation:** มีการตรวจสอบเงื่อนไขอย่างเข้มงวด ทั้งการเช็คคะแนนขั้นต่ำ และระบบป้องกันการกดรับรางวัลซ้ำซ้อนใน Checkpoint เดิม (Duplicate Claim Prevention)
- **Transactional Operations:** ประมวลผลการแจกคะแนนและบันทึกประวัติด้วย Database Transaction เพื่อรับประกันความสมบูรณ์ของข้อมูล (Atomicity)
- **Data Pagination:** ระบบดึงข้อมูลประวัติการเล่นทั้งแบบส่วนตัว (Personal) และแบบรวม (Global) โดยรองรับ Pagination เพื่อความรวดเร็วในการส่งมอบข้อมูล
- **Automated Testing (Jest):** ควบคุมคุณภาพของ Business Logic ที่สำคัญด้วยการเขียน Unit Test ด้วย Jest โดยเฉพาะ `GameService` (การสุ่มคะแนน) และ `RewardService` (การตรวจสอบ Checkpoint)
- **API Documentation:** จัดทำเอกสารคู่มือ API อย่างเป็นระบบผ่าน Apidog ครอบคลุม Request Schema, Required Fields และ Response Examples ในทุกสถานการณ์
- **Cloud Deployment:** ระบบ Backend จัดเตรียม Environment สำหรับ Production และพร้อมใช้งานจริงผ่านแพลตฟอร์ม Render Cloud

## เทคโนโลยีที่ใช้ (Tech Stack)

- NestJS
- Prisma ORM
- Supabase (PostgreSQL)
- TypeScript (Strict Mode)
- Render (Cloud Hosting)
- Apidog (API Documentation)

## การติดตั้งและใช้งาน (Installation & Getting Started)

1. โคลนโปรเจกต์และเข้าสู่โฟลเดอร์

```bash
git clone https://github.com/weerayosong/nextzy-game-server
cd nextzy-game-server
```

2. ติดตั้ง Dependencies

```bash
npm install

```

3. คัดลอกไฟล์ Environment และตั้งค่าตัวแปร

```bash
cp .env.example .env

```

_(กำหนดค่า `DATABASE_URL` ให้เชื่อมต่อกับฐานข้อมูล Supabase)_

4. สร้าง Database Schema ด้วย Prisma

```bash
npx prisma db push
npx prisma generate

```

5. รันโปรเจกต์ในโหมด Development

```bash
npm run start:dev

```

API จะเปิดให้บริการที่ `http://localhost:3001`

## บันทึกจากนักพัฒนา (Developer's Note)

นี่คือก้าวแรกของการนำ NestJS และ Prisma มาใช้ในการออกแบบสถาปัตยกรรมระบบจริง ผมให้ความสำคัญกับการวางโครงสร้างให้รองรับข้อมูลปริมาณมหาศาลและการจัดการข้อผิดพลาดอย่างเป็นระบบ หากมีจุดใดในโค้ดหรือการออกแบบที่สามารถปรับปรุงให้เป็นไปตาม Best Practice ได้มากขึ้น ผมยินดีรับฟังและพร้อมเรียนรู้เสมอครับ
