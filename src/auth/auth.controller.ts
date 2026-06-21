import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('nickname') nickname: string) {
    // ดักจับกรณีส่งค่าว่างหรือไม่ได้ส่ง nickname มา
    if (!nickname || nickname.trim() === '') {
      throw new BadRequestException('Nickname is required');
    }

    return this.authService.login(nickname.trim());
  }
}
