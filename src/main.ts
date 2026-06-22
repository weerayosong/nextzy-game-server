import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // เปิดอนุญาตให้ Frontend (พอร์ต 3000) สามารถดึงข้อมูลได้
  app.enableCors({
    origin: ['http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // เปลี่ยน Backend ให้ไปรันที่พอร์ต 3001 แทน
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((err) => {
  console.error('Error durin application startup:', err);
});
