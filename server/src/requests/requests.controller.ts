import { Controller, Post, Body, Get, Query, UseGuards, Request ,Req} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ParseIntPipe } from '@nestjs/common';
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // 🔐 PROTECTED: only logged-in users can create
@Get('debug')
debug(@Req() req) {
  return req.user;
}
@Get('my-requests')
@Get('my-requests')
getMyRequests(
  @Req() req,
  @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
) {
  const userId = req.user.userId || req.user.sub;

  return this.requestsService.getMyRequests(userId, page, limit);
}

@Post()
createRequest(@Body() dto: CreateRequestDto, @Request() req) {
  return this.requestsService.createRequest(req.user.userId, dto);
}
}