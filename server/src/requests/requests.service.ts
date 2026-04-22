import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { AiService } from '../ai/ai.service';

import { Document } from 'mongoose';

export type RequestDocument = Request & Document;

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name)
    private requestModel: Model<RequestDocument>,
    private aiService: AiService,
  ) {}

  async create(userId: string, dto: CreateRequestDto) {
  const request = await this.requestModel.create({
    userId,
    category: dto.category,
    summary: dto.summary,
    urgency: dto.urgency,
  });

  setImmediate(async () => {
    try {
      await this.aiService.enrichRequest(request._id.toString());
    } catch (err) {
      console.error('AI enrichment failed:', err);
    }
  });

  return request;
}

  async findAll(page = 1, limit = 10, category?: string) {
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), 50);

    const allowedCategories = ['billing', 'support', 'feedback', 'general'];

    const query =
      category && allowedCategories.includes(category)
        ? { category }
        : {};

    return this.requestModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}