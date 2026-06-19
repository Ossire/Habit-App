import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Habit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: 0 })
  currentStreak!: number;

  // Stores completed dates as an array of ISO strings: ['2026-06-17', '2026-06-18']
  @Column('simple-array', { default: '' })
  completedDates!: string[];
}
