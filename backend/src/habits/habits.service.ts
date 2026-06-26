// src/habits/habits.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectHabitsDto } from './dto/select-habits.dto';
import { Habit } from './entities/habit.entity';
import { HabitLog } from './entities/habit-log.entity';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,

    @InjectRepository(HabitLog)
    private habitLogRepository: Repository<HabitLog>,
  ) {}

  async getSystemHabits(): Promise<Habit[]> {
    return this.habitRepository.find({
      where: { isSystem: true },
      order: { createdAt: 'ASC' },
    });
  }

  async selectHabits(userId: string, dto: SelectHabitsDto): Promise<Habit[]> {
    // Verify all the IDs the user sent actually exist as system habits
    const habits = await this.habitRepository.find({
      where: dto.habitIds.map((id) => ({ id, isSystem: true })),
    });

    if (habits.length === 0) {
      throw new Error('No valid habits found');
    }

    // For each selected habit, create a personal copy for that user
    const userHabits = habits.map((habit) =>
      this.habitRepository.create({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        icon: habit.icon,
        isSystem: false,
        userId: userId,
      }),
    );

    return this.habitRepository.save(userHabits);
  }

  async getDashboard(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Get all habits belonging to this user
    const habits = await this.habitRepository.find({
      where: { userId, isSystem: false },
      order: { createdAt: 'ASC' },
    });

    // Get all logs for today
    const todayLogs = await this.habitLogRepository.find({
      where: { userId, date: today },
    });

    const completedHabitIds = new Set(todayLogs.map((log) => log.habitId));

    const formattedHabits = habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      icon: habit.icon,
      completedToday: completedHabitIds.has(habit.id),
    }));

    const completedCount = formattedHabits.filter(
      (h) => h.completedToday,
    ).length;
    const totalCount = formattedHabits.length;
    const progressPercentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      date: today,
      progressPercentage,
      completedCount,
      totalCount,
      habits: formattedHabits,
    };
  }

  async completeHabit(userId: string, habitId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Check if already completed today
    const existing = await this.habitLogRepository.findOne({
      where: { userId, habitId, date: today },
    });

    if (existing) {
      return { message: 'Already completed today' };
    }

    const log = this.habitLogRepository.create({
      userId,
      habitId,
      date: today,
    });
    await this.habitLogRepository.save(log);

    return { message: 'Habit completed' };
  }

  async uncompleteHabit(userId: string, habitId: string) {
    const today = new Date().toISOString().split('T')[0];

    await this.habitLogRepository.delete({ userId, habitId, date: today });

    return { message: 'Habit uncompleted' };
  }

  async getHabitDetail(userId: string, habitId: string) {
    const habit = await this.habitRepository.findOne({
      where: { id: habitId, userId },
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    // Get the last 7 days as 'YYYY-MM-DD' strings
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // Get logs for this habit in the last 7 days
    const logs = await this.habitLogRepository.find({
      where: { userId, habitId },
    });

    const completedDates = new Set(logs.map((log) => log.date));

    // Build the weekly activity array (Mon - Sun)
    const weeklyActivity = last7Days.map((date) => ({
      date,
      completed: completedDates.has(date),
    }));

    // Calculate current streak — count back from today
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (completedDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      icon: habit.icon,
      currentStreak: streak,
      weeklyActivity,
    };
  }

  async getProgress(userId: string) {
    const habits = await this.habitRepository.find({
      where: { userId, isSystem: false },
    });

    // Get all logs for this user in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const logs = await this.habitLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.date >= :fromDate', { fromDate })
      .getMany();

    // Group logs by habitId for easy lookup
    const logsByHabit = new Map<string, string[]>();
    for (const log of logs) {
      if (!logsByHabit.has(log.habitId)) {
        logsByHabit.set(log.habitId, []);
      }
      logsByHabit.get(log.habitId)!.push(log.date);
    }

    // Calculate consistency % for each habit (completed days / 30)
    const habitStats = habits.map((habit) => {
      const completedDays = logsByHabit.get(habit.id)?.length ?? 0;
      const consistency = Math.round((completedDays / 30) * 100);

      // Calculate streak
      let streak = 0;
      const completedDates = new Set(logsByHabit.get(habit.id) ?? []);
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (completedDates.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }

      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        category: habit.category,
        consistency,
        streak,
      };
    });

    // Split into strong (90%+) and needs attention (below 90%)
    const strongHabits = habitStats.filter((h) => h.consistency >= 90);
    const needsAttention = habitStats.filter((h) => h.consistency < 90);

    // Monthly trend — group completions by week (W1-W4)
    const monthlyTrend = [1, 2, 3, 4].map((week) => {
      const weekLogs = logs.filter((log) => {
        const dayOfMonth = new Date(log.date).getDate();
        return Math.ceil(dayOfMonth / 7) === week;
      });
      return {
        label: `W${week}`,
        completions: weekLogs.length,
      };
    });

    return {
      strongHabits,
      needsAttention,
      monthlyTrend,
    };
  }

  async getHeatmap(userId: string) {
    // Get last 84 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 83);
    const fromDate = startDate.toISOString().split('T')[0];

    const logs = await this.habitLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.date >= :fromDate', { fromDate })
      .getMany();

    // Count completions per day
    const countByDate = new Map<string, number>();
    for (const log of logs) {
      countByDate.set(log.date, (countByDate.get(log.date) ?? 0) + 1);
    }

    // Build 84 day grid
    const grid = Array.from({ length: 84 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (83 - i));
      const dateStr = date.toISOString().split('T')[0];
      const count = countByDate.get(dateStr) ?? 0;

      // Intensity: 0 = none, 1 = low, 2 = medium, 3 = high
      let intensity = 0;
      if (count >= 1) intensity = 1;
      if (count >= 2) intensity = 2;
      if (count >= 3) intensity = 3;

      return { date: dateStr, count, intensity };
    });

    return { grid };
  }
}
