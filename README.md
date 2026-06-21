# [WIP] Nextzy Gamification - Backend (Server)

ระบบส่วนหลังบ้าน (Backend) สำหรับโปรเจกต์ Nextzy Gamification พัฒนาด้วย NestJS และ Prisma ORM โดยมุ่งเน้นที่ความปลอดภัยของข้อมูลและรองรับการขยายตัว

Repository ฝั่ง Frontend (Next.js): [Link to Frontend Repository](https://github.com/weerayosong/nextzy-game-client)

## การออกแบบระบบและสถาปัตยกรรม (System Design & Software Architecture)

[Link to Documentation](https://subtle-pastelito-35134b.netlify.app)

โปรเจกต์นี้ออกแบบโครงสร้างตามมาตรฐานของ NestJS และ Clean Architecture:

- **Modular Structure:** โค้ดถูกแบ่งออกเป็นโมดูลที่มีหน้าที่เฉพาะเจาะจงอย่างชัดเจน (Auth, Game, Reward, History) ตามหลัก Single Responsibility Principle
- **Data Integrity:** ควบคุมความถูกต้องของข้อมูลด้วย Database Constraints ระดับ Schema (เช่น `@@unique([userId, checkpoint])`) เพื่อป้องกัน Race Condition
- **Performance Strategy:** ลดภาระการคำนวณของเซิร์ฟเวอร์ด้วยการทำ Denormalization (เก็บผลรวมคะแนนไว้ที่ตาราง User) และใช้วิธี Bulk Import ข้อมูล 1 ล้านแถวผ่านระบบของ Supabase โดยตรง
- **Error Handling:** จัดการข้อผิดพลาดจากศูนย์กลางด้วย Exception Filters เพื่อให้ API คืนค่า HTTP Status ที่เป็นมาตรฐาน

## ฟีเจอร์หลัก (Core Features)

- **RESTful API:** ให้บริการ API สำหรับเข้าสู่ระบบ, สุ่มคะแนน, รับรางวัล, และเรียกดูประวัติ
- **Transactional Operations:** ประมวลผลการสุ่มคะแนนและอัปเดตคะแนนสะสมด้วย Database Transaction เพื่อรับประกันความสมบูรณ์ของข้อมูล
- **Pagination:** รองรับการดึงข้อมูลประวัติจำนวนมากผ่านระบบ Pagination เพื่อความรวดเร็วในการส่งมอบข้อมูล

## เทคโนโลยีที่ใช้ (Tech Stack)

- NestJS
- Prisma ORM
- Supabase (PostgreSQL)
- TypeScript (Strict Mode)

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

API จะเปิดให้บริการที่ `http://localhost:3000`

## บันทึกจากนักพัฒนา (Developer's Note)

นี่คือก้าวแรกของการนำ NestJS และ Prisma มาใช้ในการออกแบบสถาปัตยกรรมระบบจริง ผมให้ความสำคัญกับการวางโครงสร้างให้รองรับข้อมูลปริมาณมหาศาลและการจัดการข้อผิดพลาดอย่างเป็นระบบ หากมีจุดใดในโค้ดหรือการออกแบบที่สามารถปรับปรุงให้เป็นไปตาม Best Practice ได้มากขึ้น ผมยินดีรับฟังและพร้อมเรียนรู้เสมอครับ
