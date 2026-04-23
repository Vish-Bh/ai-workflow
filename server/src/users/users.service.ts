import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schemas/users.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // ---------------- SIGNUP ----------------
 async createUser(dto: CreateUserDto) {
  console.log("DTO:", dto);
  const existing = await this.userModel.findOne({ email: dto.email });
  if (existing) throw new ConflictException('User already exists');

  const user = await this.userModel.create({
    name: dto.name,
    email: dto.email,
    password: dto.password, // ✅ already hashed
  });

  return user;
}

  // ---------------- FIND USER BY EMAIL ----------------
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // ---------------- VALIDATE LOGIN ----------------
  async validateUser(dto: LoginUserDto) {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async getUserById(userId: string) {
  return this.userModel.findById(userId).select('-password');
}
}