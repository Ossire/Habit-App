// src/habits/entities/habit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Habit } from './habit.entity';

@Entity('habit_logs')
@Unique(['userId', 'habitId', 'date']) // one log per user per habit per day
export class HabitLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => Habit, (habit) => habit.logs, { onDelete: 'CASCADE' })
  habit!: Habit;

  @Column()
  habitId!: string;

  @Column({ type: 'date' })
  date!: string; // stored as 'YYYY-MM-DD'

  @CreateDateColumn()
  completedAt!: Date;
}
