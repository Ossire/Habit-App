// src/habits/habits.seed.ts
import { DataSource } from 'typeorm';
import { Habit } from './entities/habit.entity';

const systemHabits = [
  {
    name: 'Drink Water',
    description: '8 glasses daily',
    category: 'Health',
    icon: 'drop',
    isSystem: true,
  },
  {
    name: 'Read 10 Pages',
    description: 'Broaden mind',
    category: 'Study',
    icon: 'book',
    isSystem: true,
  },
  {
    name: 'Go for a Run',
    description: 'Cardio health',
    category: 'Fitness',
    icon: 'run',
    isSystem: true,
  },
  {
    name: 'Meditate',
    description: '10 mins peace',
    category: 'Mindfulness',
    icon: 'meditate',
    isSystem: true,
  },
  {
    name: 'Journaling',
    description: 'Daily thoughts',
    category: 'Mindfulness',
    icon: 'journal',
    isSystem: true,
  },
  {
    name: 'Stretch',
    description: 'Flexibility',
    category: 'Fitness',
    icon: 'stretch',
    isSystem: true,
  },
];

export async function seedHabits(dataSource: DataSource) {
  const habitRepo = dataSource.getRepository(Habit);

  for (const habit of systemHabits) {
    // Don't insert duplicates if seed runs more than once
    const exists = await habitRepo.findOne({
      where: { name: habit.name, isSystem: true },
    });
    if (!exists) {
      await habitRepo.save(habitRepo.create(habit));
    }
  }

  console.log('✅ System habits seeded');
}
