import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHabitDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  trackingType?: string; // defaults to 'toggle' if not sent

  @IsOptional()
  @IsNumber()
  dailyTarget?: number;

  @IsOptional()
  @IsString()
  targetUnit?: string;
}
