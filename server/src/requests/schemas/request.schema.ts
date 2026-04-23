import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true }) // ✅ ADD THIS
  message: string;

  @Prop({ default: '' })
  summary: string;

  @Prop({ default: 'general' })
  category: string;

  @Prop({ default: 'low' })
  urgency: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);