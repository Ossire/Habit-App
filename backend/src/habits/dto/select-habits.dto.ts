// src/habits/dto/select-habits.dto.ts
import { IsArray, IsString } from 'class-validator';

export class SelectHabitsDto {
  @IsArray()
  @IsString({ each: true })
  habitIds!: string[];
}
