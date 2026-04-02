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
  async setSingleTransactionAsDone(
    @Request() req: any,
    @Param('transactionId') transactionId: number,
  ) {
    return await this.transactionService.setTransactionAsDone(req.user, [
      transactionId,
    ]);
  }

  @Patch('setdone')
  @UseGuards(JwtAuthGuard)
  async setBulkTransactionAsDone(
    @Request() req: any,
    @Query('transactionIds') transactionIds: any,
  ) {
    const parsed = transactionIds.split(',').map(Number);

    return await this.transactionService.setTransactionAsDone(req.user, parsed);
  }
}
