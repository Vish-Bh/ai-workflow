import { Body,UseGuards, Controller, Post,Get,Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}


 @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
  return this.usersService.getUserById(req.user.userId);
}

}