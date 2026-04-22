import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Request {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  message: string;

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