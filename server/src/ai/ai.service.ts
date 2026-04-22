import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from '../requests/schemas/request.schema';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
  ) { }

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
              content:
 `You are a support request triage assistant.

Return ONLY valid JSON:
{
  "category": "billing" | "support" | "feedback" | "general",
  "summary": "One-line summary",
  "urgency": "low" | "medium" | "high"
}`
            },
            {
              role: 'user',
              content: `UserId: ${request.userId}
Category: ${request.category}
Summary: ${request.summary}
Urgency: ${request.urgency}`
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

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {
          category: 'general',
          summary: 'Could not parse AI response',
          urgency: 'low',
        };
      }
      console.log(response.data);


      await this.requestModel.findByIdAndUpdate(id, parsed);

    } catch (err) {
      console.error('AI ERROR FULL:', err);
      console.error('AI ERROR MSG:', err.message);
      console.error('AI ERROR DATA:', err.response?.data);
    }
  }
}