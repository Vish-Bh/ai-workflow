import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    private aiService: AiService,
  ) {}

  async create(dto: CreateRequestDto) {
    const request = await this.requestModel.create(dto);

    // 🔥 async AI processing (DO NOT WAIT)
    setImmediate(() => {
      this.aiService.enrichRequest(request._id.toString());
    });

    return request;
  }

  async findAll(page = 1, limit = 10, category?: string) {
    const query = category ? { category } : {};

    const data = await this.requestModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return data;
  }
}