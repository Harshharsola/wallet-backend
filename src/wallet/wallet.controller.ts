import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SetupWalletDto, TransactionDto } from './dtos';
import * as path from 'path';
import * as fs from 'fs';
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @Post('setup')
  async setupWallet(@Body() setupWalletDto: SetupWalletDto, @Res() res) {
    const response = await this.walletService.create(setupWalletDto);
    res.send(response);
  }

  @Post('transact/:walletId')
  async performTransaction(
    @Param() walletId,
    @Body() transactionDto: TransactionDto,
    @Res() res,
  ) {
    const response = await this.walletService.transaction(
      walletId.walletId,
      transactionDto,
    );
    res.send(response);
  }

  @Get('transactions')
  async fetchTransaction(
    @Query('walletId') walletId: string,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Res() res,
  ) {
    const response = await this.walletService.fetchTransaction(
      walletId,
      skip,
      limit,
    );
    res.send(response);
  }

  @Get('/:walletId')
  async fetchWallet(@Param('walletId') walletId: string, @Res() res) {
    const response = await this.walletService.fetchWallet(walletId);
    res.send(response);
  }

  @Get('transactions/csv')
  async fetchTransactionCsv(@Query('walletId') walletId: string, @Res() res) {
    const csvFilePath = await this.walletService.transactionCsv(walletId);
    if (csvFilePath.startsWith('404')) {
      res.status(404).send(csvFilePath.split(': ')[1]);
    } else {
      res.download(csvFilePath, 'transactions.csv', (err) => {
        if (err) {
          console.error(err);
        } else {
          fs.unlinkSync(csvFilePath);
        }
      });
    }
  }
}
