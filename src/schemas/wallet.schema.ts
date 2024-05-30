import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet {
  @Prop()
  name: string;

  @Prop()
  balance: number;

  @Prop()
  date: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
