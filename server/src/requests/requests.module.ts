import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Request, RequestSchema } from './schemas/request.schema';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module'; // 🔥 ADD THIS

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Request.name, schema: RequestSchema },
    ]),
    AiModule,
    AuthModule, // 🔥 REQUIRED FOR JWT STRATEGY TO WORK
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}