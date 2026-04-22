import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // 🔐 PROTECTED: only logged-in users can create
@UseGuards(JwtAuthGuard)
@Get('debug')
debug(@Req() req) {
  return req.user;
}

  // 🌐 PUBLIC or optionally protect later
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
  ) {
    return this.requestsService.findAll(Number(page), Number(limit), category);
  }
}