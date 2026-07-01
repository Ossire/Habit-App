import { IsNumber, IsPositive } from 'class-validator';

export class LogHabitDto {
  @IsNumber()
  @IsPositive()
  value!: number; // e.g. 25 minutes, 30 reps, 45 seconds
}
