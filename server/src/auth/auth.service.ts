import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await this.usersService.createUser({
    name,
    email,
    password: hashedPassword,
  });

  return this.generateToken(user); // reuse same logic
}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

 private generateToken(user: any) {
  const token = this.jwtService.sign({
    sub: user._id.toString(),
    email: user.email,
    name: user.name, // ✅ ADD THIS
  });

  return {
    access_token: token,
  };
}
}