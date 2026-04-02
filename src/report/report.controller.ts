import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('fetchall')
  @UseGuards(JwtAuthGuard)
  async fetchAllReports(@Request() req: any, @Query() filters: any) {
    return await this.reportService.fetchAllReports(req.user, filters);
  }
}
