import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from '../requests/schemas/request.schema';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) {}

  async enrichRequest(id: string) {
    console.log('AI started for:', id);

    const request = await this.requestModel.findById(id);
    if (!request) return;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct-v0.1',
          messages: [
            {
              role: 'system',
              content: `You are a support request triage assistant.

Return ONLY valid JSON:
{
  "category": "billing" | "support" | "feedback" | "general",
  "summary": "One-line summary",
  "urgency": "low" | "medium" | "high"
}`
            },
            {
              role: 'user',
              content: `User message:
"${request.message}"`
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
        },
      );

      const text = response.data.choices[0].message.content;

      let parsed: any = {};

      try {
        const match = text.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : {};
      } catch {
        parsed = {};
      }

      // ✅ Safe fallback merge
      const updateData = {
        category: parsed.category || request.category || 'general',
        urgency: parsed.urgency || request.urgency || 'low',
        summary: parsed.summary || request.summary || 'No summary generated',
      };

      await this.requestModel.findByIdAndUpdate(id, {
        $set: updateData,
      });

      console.log('AI updated:', updateData);

    } catch (err) {
      console.error('AI ERROR:', err.response?.data || err.message);
    }
  }
}