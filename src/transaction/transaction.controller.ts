import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('fetchall')
  @UseGuards(JwtAuthGuard)
  async fetchAllTransactions(@Request() req: any, @Query() filters: any) {
    return await this.transactionService.fetchAllTransactions(
      req.user,
      filters,
    );
  }

  @Patch('setdone/:transactionId')
  @UseGuards(JwtAuthGuard)
  async setTransactionAsDone(
    @Request() req: any,
    @Param('transactionId') transactionId: number,
  ) {
    return await this.transactionService.setTransactionAsDone(
      req.user,
      transactionId,
    );
  }
}
