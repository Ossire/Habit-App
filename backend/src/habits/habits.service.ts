import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectHabitsDto } from './dto/select-habits.dto';
import { Habit } from './entities/habit.entity';
import { HabitLog } from './entities/habit-log.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,

    @InjectRepository(HabitLog)
    private habitLogRepository: Repository<HabitLog>,
  ) {}

  async createHabit(userId: string, dto: CreateHabitDto): Promise<Habit> {
    const habit = this.habitRepository.create({
      name: dto.name,
      description: dto.description ?? '',
      category: dto.category,
      icon: dto.icon ?? 'default',
      trackingType: dto.trackingType ?? 'toggle',
      dailyTarget: dto.dailyTarget ?? null,
      targetUnit: dto.targetUnit ?? null,
      isSystem: false,
      userId,
    } as Habit);

    return this.habitRepository.save(habit);
  }

  async getSystemHabits(): Promise<Habit[]> {
    return this.habitRepository.find({
      where: { isSystem: true },
      order: { createdAt: 'ASC' },
    });
  }

  async selectHabits(userId: string, dto: SelectHabitsDto): Promise<Habit[]> {
    const habits = await this.habitRepository.find({
      where: dto.habitIds.map((id) => ({ id, isSystem: true })),
    });

    if (habits.length === 0) {
      throw new NotFoundException('No valid habits found');
    }

    const userHabits = habits.map((habit) =>
      this.habitRepository.create({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        icon: habit.icon,
        trackingType: 'toggle', // system habits default to toggle
        isSystem: false,
        userId,
      }),
    );

    return this.habitRepository.save(userHabits);
  }

  async getDashboard(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const habits = await this.habitRepository.find({
      where: { userId, isSystem: false },
      order: { createdAt: 'ASC' },
    });

    const todayLogs = await this.habitLogRepository.find({
      where: { userId, date: today },
    });

    // Map habitId -> log for today
    const todayLogMap = new Map(todayLogs.map((log) => [log.habitId, log]));

    const formattedHabits = habits.map((habit) => {
      const todayLog = todayLogMap.get(habit.id);
      const completedToday = this.isCompleted(habit, todayLog);

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        icon: habit.icon,
        trackingType: habit.trackingType,
        dailyTarget: habit.dailyTarget,
        targetUnit: habit.targetUnit,
        completedToday,
        // For count/duration/timer — show current logged value
        loggedValue: todayLog?.value ?? null,
      };
    });

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

  // Toggle and Timer habits — just mark done/undone
  async completeHabit(userId: string, habitId: string) {
    const today = new Date().toISOString().split('T')[0];

    const habit = await this.habitRepository.findOne({
      where: { id: habitId, userId },
    });
    if (!habit) throw new NotFoundException('Habit not found');

    // Only toggle and timer use this endpoint
    if (habit.trackingType === 'count' || habit.trackingType === 'duration') {
      throw new BadRequestException(
        'Use POST /habits/:id/log for count and duration habits',
      );
    }

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
      value: null, // toggle/timer don't need a value
    });
    await this.habitLogRepository.save(log);

    return { message: 'Habit completed' };
  }

  // Count and Duration habits — log a value
  async logHabit(userId: string, habitId: string, dto: LogHabitDto) {
    const today = new Date().toISOString().split('T')[0];

    const habit = await this.habitRepository.findOne({
      where: { id: habitId, userId },
    });
    if (!habit) throw new NotFoundException('Habit not found');

    if (habit.trackingType !== 'count' && habit.trackingType !== 'duration') {
      throw new BadRequestException(
        'Use POST /habits/:id/complete for toggle and timer habits',
      );
    }

    // Check if a log already exists for today — update it if so
    const existing = await this.habitLogRepository.findOne({
      where: { userId, habitId, date: today },
    });

    if (existing) {
      existing.value = dto.value;
      await this.habitLogRepository.save(existing);
    } else {
      const log = this.habitLogRepository.create({
        userId,
        habitId,
        date: today,
        value: dto.value,
      });
      await this.habitLogRepository.save(log);
    }

    // Check if target is met
    const completed = habit.dailyTarget ? dto.value >= habit.dailyTarget : true;

    return {
      message: completed ? 'Target reached!' : 'Progress logged',
      value: dto.value,
      target: habit.dailyTarget,
      targetUnit: habit.targetUnit,
      completed,
    };
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

    if (!habit) throw new NotFoundException('Habit not found');

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const logs = await this.habitLogRepository.find({
      where: { userId, habitId },
    });

    // For completion check, consider tracking type
    const completedDates = new Set(
      logs.filter((log) => this.isCompleted(habit, log)).map((log) => log.date),
    );

    const weeklyActivity = last7Days.map((date) => {
      const log = logs.find((l) => l.date === date);
      return {
        date,
        completed: completedDates.has(date),
        value: log?.value ?? null,
      };
    });

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
      trackingType: habit.trackingType,
      dailyTarget: habit.dailyTarget,
      targetUnit: habit.targetUnit,
      currentStreak: streak,
      weeklyActivity,
    };
  }

  async getProgress(userId: string) {
    const habits = await this.habitRepository.find({
      where: { userId, isSystem: false },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const logs = await this.habitLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.date >= :fromDate', { fromDate })
      .getMany();

    const logsByHabit = new Map<string, HabitLog[]>();
    for (const log of logs) {
      if (!logsByHabit.has(log.habitId)) {
        logsByHabit.set(log.habitId, []);
      }
      logsByHabit.get(log.habitId)!.push(log);
    }

    const today = new Date().toISOString().split('T')[0];

    const habitStats = habits.map((habit) => {
      const habitLogs = logsByHabit.get(habit.id) ?? [];

      // Count only logs where target was actually met
      const completedLogs = habitLogs.filter((log) =>
        this.isCompleted(habit, log),
      );
      const completedDates = new Set(completedLogs.map((log) => log.date));

      const completedDays = completedDates.size;
      const consistency = Math.round((completedDays / 30) * 100);

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

      let daysSinceLastCompletion = 999;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if (completedDates.has(dateStr)) {
          daysSinceLastCompletion = i;
          break;
        }
      }

      let status = 'LOW_CONSISTENCY';
      if (daysSinceLastCompletion >= 3 && daysSinceLastCompletion < 999) {
        status = 'MISSED_3_DAYS';
      } else if (daysSinceLastCompletion === 999 || consistency < 20) {
        status = 'STAGNANT';
      }

      return {
        id: habit.id,
        name: habit.name,
        icon: habit.icon,
        category: habit.category,
        consistency,
        streak,
        status,
        completedToday: completedDates.has(today),
      };
    });

    const strongHabits = habitStats.filter((h) => h.consistency >= 90);
    const needsAttention = habitStats.filter((h) => h.consistency < 90);

    const monthlyTrend = [1, 2, 3, 4].map((week) => {
      const weekLogs = logs.filter((log) => {
        const dayOfMonth = new Date(log.date).getDate();
        return Math.ceil(dayOfMonth / 7) === week;
      });
      return { label: `W${week}`, completions: weekLogs.length };
    });

    const categoryMap = new Map<string, typeof habitStats>();
    for (const habit of habitStats) {
      if (!categoryMap.has(habit.category)) {
        categoryMap.set(habit.category, []);
      }
      categoryMap.get(habit.category)!.push(habit);
    }

    const domainMastery = Array.from(categoryMap.entries()).map(
      ([category, categoryHabits]) => {
        const avgConsistency = Math.round(
          categoryHabits.reduce((sum, h) => sum + h.consistency, 0) /
            categoryHabits.length,
        );
        const completedToday = categoryHabits.filter(
          (h) => h.completedToday,
        ).length;

        return {
          category,
          consistency: avgConsistency,
          totalHabits: categoryHabits.length,
          completedToday,
        };
      },
    );

    return { strongHabits, needsAttention, monthlyTrend, domainMastery };
  }

  async getHeatmap(userId: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 83);
    const fromDate = startDate.toISOString().split('T')[0];

    const logs = await this.habitLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.date >= :fromDate', { fromDate })
      .getMany();

    const countByDate = new Map<string, number>();
    for (const log of logs) {
      countByDate.set(log.date, (countByDate.get(log.date) ?? 0) + 1);
    }

    const grid = Array.from({ length: 84 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (83 - i));
      const dateStr = date.toISOString().split('T')[0];
      const count = countByDate.get(dateStr) ?? 0;

      let intensity = 0;
      if (count >= 1) intensity = 1;
      if (count >= 2) intensity = 2;
      if (count >= 3) intensity = 3;

      return { date: dateStr, count, intensity };
    });

    return { grid };
  }

  // Helper — determines if a log counts as "completed" based on tracking type
  private isCompleted(habit: Habit, log: HabitLog | undefined): boolean {
    if (!log) return false;

    // Toggle and timer — just having a log means done
    if (habit.trackingType === 'toggle' || habit.trackingType === 'timer') {
      return true;
    }

    // Count and duration — value must meet or exceed the daily target
    if (habit.trackingType === 'count' || habit.trackingType === 'duration') {
      if (log.value === null || log.value === undefined) return false;
      if (!habit.dailyTarget) return true; // no target set = any value counts
      return log.value >= habit.dailyTarget;
    }

    return false;
  }
}
