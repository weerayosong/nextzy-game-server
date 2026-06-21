import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // เปิดอนุญาตให้ Frontend (พอร์ต 3000) สามารถดึงข้อมูลได้
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // เปลี่ยน Backend ให้ไปรันที่พอร์ต 3001 แทน
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((err) => {
  console.error('Error durin application startup:', err);
});
