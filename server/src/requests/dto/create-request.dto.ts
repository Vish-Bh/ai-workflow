import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(['billing', 'support', 'feedback', 'general'])
  category?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  urgency?: string;
}