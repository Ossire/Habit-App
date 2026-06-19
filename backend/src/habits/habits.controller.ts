import { Controller, Get, Patch, Param, Post, Body } from '@nestjs/common';
import { HabitsService } from './habits.service';

@Controller('api/habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.habitsService.getDashboardData();
  }

  @Patch(':id/toggle')
  toggleHabit(@Param('id') id: string) {
    return this.habitsService.toggleHabit(+id);
  }

  @Post()
  createHabit(@Body('name') name: string) {
    // Quick inline save for the MVP
    return this.habitsService['habitRepository'].save({ name });
  }
}
