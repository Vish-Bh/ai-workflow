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

    const request = await this.requestModel.findById(id);
    if (!request) return;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct-v0.1',
          messages: [
            {
              role: "system",
              content: `
You are an intelligent support request triage system.

Your job is to analyze a user's message and classify it accurately.

You MUST return ONLY valid JSON. No extra text.

---

### OUTPUT FORMAT:
{
  "category": "billing" | "support" | "feedback" | "general" | "other",
  "summary": "One clear, concise sentence summarizing the issue",
  "urgency": "low" | "medium" | "high"
}

---

### CATEGORY RULES:

- billing → payments, refunds, charges, invoices, subscriptions, pricing issues
- support → bugs, technical issues, errors, login issues, app not working, API problems
- feedback → suggestions, opinions, complaints without a technical problem, UX/UI feedback
- general → questions, unclear intent, greetings, non-actionable messages
- other → ONLY when the message does NOT clearly fit any category OR is ambiguous

If unsure between categories, prefer "other" instead of guessing incorrectly.

---

### URGENCY RULES:

- high → system broken, payment failure, data loss, cannot access account, critical blocking issue
- medium → feature not working properly, partial failure, inconvenience but workaround exists
- low → general questions, feedback, minor issues, informational requests

---

### SUMMARY RULES:
- Must be a single sentence
- Must describe the core problem clearly
- Do NOT include user emotion or filler words
- Focus on actionable meaning

---

### IMPORTANT RULES:
- Never explain your reasoning
- Never add extra fields
- Never return invalid JSON
- If message is unclear, classify as:
  category: "other"
  urgency: "low"

---

### EXAMPLES:

User: "I was charged twice for my subscription"
{
  "category": "billing",
  "summary": "User reports being charged twice for a subscription",
  "urgency": "high"
}

User: "App keeps crashing when I open settings"
{
  "category": "support",
  "summary": "App crashes when opening settings",
  "urgency": "high"
}

User: "Can you add dark mode?"
{
  "category": "feedback",
  "summary": "User requests dark mode feature",
  "urgency": "low"
}

User: "Hi"
{
  "category": "general",
  "summary": "User sent a greeting",
  "urgency": "low"
}

User: "Something is wrong but I don't know what"
{
  "category": "other",
  "summary": "User reports an unspecified issue",
  "urgency": "low"
}
`
            },
            {
              role: "user",
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


    } catch (err) {
      console.error('AI ERROR:', err.response?.data || err.message);
    }
  }
}