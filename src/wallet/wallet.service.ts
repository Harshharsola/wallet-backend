import { Injectable } from '@nestjs/common';
import { SetupWalletDto, TransactionDto } from './dtos';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from 'src/schemas/wallet.schema';
import { Model } from 'mongoose';
import { getApiResponse } from 'src/utils';
import { Transaction } from 'src/schemas/transaction.schema';
import { transactionType } from 'src/constants';
import { Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as fastCsv from 'fast-csv';

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

  async transaction(walletId: string, transactionDto: TransactionDto) {
    const currentTime = new Date();

    const wallet_Id = new Types.ObjectId(walletId);

    try {
      const wallet = await this.walletModel.findById(wallet_Id);
      if (wallet === null) {
        return getApiResponse({}, '404', 'wallet not found');
      }
      const newBalance = wallet.balance + +transactionDto.amount;
      if (newBalance < 0) {
        return getApiResponse({}, '400', 'insufficient funds');
      }

      const newTransaction = await this.createTransation({
        balance: newBalance,
        walletId: wallet_Id,
        amount: transactionDto.amount,
        description: transactionDto.description,
        date: currentTime,
      });

      await this.walletModel.updateOne(
        { _id: wallet._id },
        { balance: newBalance },
      );
      return getApiResponse(
        { balance: newBalance, transactionId: newTransaction._id },
        '200',
        'transaction successful',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async fetchTransaction(walletId: string, skip: number, limit: number) {
    const objectId = new Types.ObjectId(walletId);

    const wallet = await this.walletModel.findById(objectId);
    if (!wallet) {
      return getApiResponse({}, '404', 'wallet not found');
    }
    const transactionsCount = await this.transactionModel.countDocuments({
      walletId: objectId,
    });

    const transactions = await this.transactionModel
      .find({ walletId: objectId })
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    return getApiResponse(
      { transactions, transactionsCount },
      '200',
      'get transactions successfull',
    );
  }

  async fetchWallet(walletId: string) {
    const objectId = new Types.ObjectId(walletId);

    const wallet = await this.walletModel.findById(objectId);
    if (!wallet) {
      return getApiResponse({}, '404', 'wallet not found');
    } else {
      return getApiResponse(
        {
          id: wallet._id,
          balance: wallet.balance,
          name: wallet.name,
          date: wallet.date,
        },
        '200',
        'get wallet successfull',
      );
    }
  }

  async transactionCsv(walletId: string): Promise<string> {
    const objectId = new Types.ObjectId(walletId);

    const wallet = await this.walletModel.findById(objectId);
    if (!wallet) {
      return '404: Wallet not found';
    }

    const transactions = await this.transactionModel
      .find({ walletId: objectId })
      .lean();
    const tmpDir = path.join(__dirname, '..', '..', 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const csvFilePath = path.join(tmpDir, `transactions_${Date.now()}.csv`);
    const csvStream = fastCsv.format({ headers: true });
    const writableStream = fs.createWriteStream(csvFilePath);

    return new Promise((resolve, reject) => {
      writableStream.on('finish', () => {
        resolve(csvFilePath);
      });

      csvStream.on('error', (error) => {
        reject(error);
      });

      csvStream.pipe(writableStream);
      transactions.forEach((transaction) => {
        csvStream.write({
          id: transaction._id,
          walletId: transaction.walletId,
          amount: transaction.amount,
          balance: transaction.balance,
          description: transaction.description,
          date: transaction.date,
          type: transaction.type,
        });
      });
      csvStream.end();
    });
  }
}
