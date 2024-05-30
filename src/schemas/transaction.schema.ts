import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop()
  balance: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true })
  walletId: string;

  @Prop()
  amount: number;

  @Prop()
  description: string;

  @Prop()
  date: Date;

  @Prop()
  type: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
