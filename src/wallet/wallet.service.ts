import { Injectable } from '@nestjs/common';
import { SetupWalletDto } from './dtos';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from 'src/schemas/wallet.schema';
import { Model } from 'mongoose';
import { getApiResponse } from 'src/utils';
import { Transaction } from 'src/schemas/transaction.schema';
import { transactionType } from 'src/constants';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}
  async create(setupWalletDto: SetupWalletDto) {
    const currentTime = new Date();
    try {
      const wallet = await this.walletModel.findOne({
        name: setupWalletDto.name,
      });
      console.log(wallet);
      if (wallet !== null) {
        return getApiResponse({}, '409', 'name already in use');
      }
      const createdWallet = new this.walletModel({
        name: setupWalletDto.name,
        balance: setupWalletDto.balance,
        date: currentTime,
      });
      const newTransaction = await this.createTransation({
        balance: setupWalletDto.balance,
        walletId: createdWallet._id,
        amount: setupWalletDto.balance,
        description: 'Wallet setup',
        date: currentTime,
      });

      await createdWallet.save();
      return getApiResponse(
        {
          _id: createdWallet._id,
          transactionId: newTransaction._id,
          name: setupWalletDto.name,
        },
        '200',
        'successfully created wallet',
      );
    } catch (error) {
      console.log(error);
      return getApiResponse({}, '500', 'internal server error');
    }
  }

  async createTransation(TransactionDetails: {
    balance: number;
    walletId: any;
    amount: number;
    description: string;
    date: Date;
  }) {
    try {
      const newTransaction = new this.transactionModel({
        balance: TransactionDetails.balance,
        walletId: TransactionDetails.walletId,
        amount: TransactionDetails.amount,
        description: TransactionDetails.description,
        date: TransactionDetails.date,
        type:
          TransactionDetails.amount > 0
            ? transactionType.CREDIT
            : transactionType.DEBIT,
      });
      return await newTransaction.save();
    } catch (error) {
      console.log(error);
    }
  }
}
