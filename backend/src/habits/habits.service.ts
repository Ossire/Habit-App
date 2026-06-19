import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from './entities/habit.entity';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
  ) {}

  // Get all habits mixed with today's completion status
  async getDashboardData() {
    const habits = await this.habitRepository.find();
    const today = new Date().toISOString().split('T')[0];

    const formattedHabits = habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      currentStreak: habit.currentStreak,
      isCompletedToday: habit.completedDates.includes(today),
    }));

    const completedCount = formattedHabits.filter(
      (h) => h.isCompletedToday,
    ).length;
    const totalCount = formattedHabits.length;
    const progressPercentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      progressPercentage,
      habits: formattedHabits,
    };
  }

  // Toggle today's completion and update streak status
  async toggleHabit(id: number) {
    const habit = await this.habitRepository.findOneBy({ id });
    if (!habit) throw new Error('Habit not found');

    const today = new Date().toISOString().split('T')[0];
    const dateIndex = habit.completedDates.indexOf(today);

    if (dateIndex > -1) {
      // Uncheck habit
      habit.completedDates.splice(dateIndex, 1);
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    } else {
      // Check habit
      habit.completedDates.push(today);
      habit.currentStreak += 1;
    }

    await this.habitRepository.save(habit);
    return this.getDashboardData(); // Return fresh layout state immediately
  }
}
