import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ---------------- SIGNUP ----------------
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  // ---------------- LOGIN (TEMP without JWT yet) ----------------
  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.usersService.validateUser(dto);
  }
}