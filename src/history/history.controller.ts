import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // เส้นที่ 1: ประวัติทั่วโลก (ไม่ต้องใช้ userId)
  @Get('global')
  async getGlobalHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    return this.historyService.getGlobalHistory(Number(page), Number(limit));
  }

  // เส้นที่ 2: ประวัติส่วนตัว (ต้องใช้ userId)
  @Get('personal/:userId')
  async getPersonalHistory(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.historyService.getPersonalHistory(
      userId,
      Number(page),
      Number(limit),
    );
  }
}
