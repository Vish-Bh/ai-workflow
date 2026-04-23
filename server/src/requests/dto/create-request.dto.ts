import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['billing', 'support', 'feedback', 'general'])
  category?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  urgency?: string;
}