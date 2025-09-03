import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Object, required: true })
  headers: Record<string, any>;

  @Prop({ type: [Object], required: true })
  receivingChain: Array<{
    server: string;
    timestamp: string;
    by: string;
    with: string;
    id: string;
    from?: string;
    for?: string;
    helo?: string;
    ip?: string;
    to?: string;
    protocol?: string;
    delayMs?: number;
    delayHuman?: string;
  }>;

  @Prop({ required: true })
  espType: string;

  @Prop({ type: Object })
  espDetails: {
    provider: string;
    confidence: number;
    indicators: string[];
  };

  @Prop({ default: 'pending' })
  status: 'pending' | 'processed' | 'error';

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  rawEmail?: Record<string, any>;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
