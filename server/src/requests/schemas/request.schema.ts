import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  userId: string;

  @Prop({
    enum: ['billing', 'support', 'feedback', 'general'],
    default: null,
  })
  category: string;

  @Prop({ default: null })
  summary: string;

  @Prop({
    enum: ['low', 'medium', 'high'],
    default: null,
  })
  urgency: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);