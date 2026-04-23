import { Body, Controller, Post,Get,Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
signup(@Body() body: { name: string; email: string; password: string }) {
  console.log(body)
  return this.authService.signup(body.name, body.email, body.password);
}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validate(@Req() req) {
    return {
      valid: true,
      user: req.user,
    };
  }

}