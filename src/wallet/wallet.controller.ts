import { Body, Controller, Post, Res } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SetupWalletDto } from './dtos';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}
  @Post('setup')
  async setupWallet(@Body() setupWalletDto: SetupWalletDto, @Res() res) {
    const response = await this.walletService.create(setupWalletDto);
    res.send(response);
  }
}
