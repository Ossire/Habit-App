// src/habits/entities/habit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HabitLog } from './habit-log.entity';

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  category!: string;

  @Column()
  icon!: string;

  @Column({ default: false })
  isSystem!: boolean;

  // If null, it's a system habit. If set, it belongs to a specific user.
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  user!: User;

  @Column({ nullable: true })
  userId!: string;

  @OneToMany(() => HabitLog, (log) => log.habit)
  logs!: HabitLog[];

  @CreateDateColumn()
  createdAt!: Date;
}
