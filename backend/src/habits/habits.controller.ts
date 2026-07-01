// src/habits/habits.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  Req,
  Param,
  Delete,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { SelectHabitsDto } from './dto/select-habits.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('habits')
@UseGuards(AuthGuard('jwt'))
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get('system')
  getSystemHabits() {
    return this.habitsService.getSystemHabits();
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.habitsService.getDashboard(req.user.id);
  }

  @Get('progress')
  getProgress(@Req() req: any) {
    return this.habitsService.getProgress(req.user.id);
  }

  @Get('heatmap')
  getHeatmap(@Req() req: any) {
    return this.habitsService.getHeatmap(req.user.id);
  }

  // Param routes always last
  @Get(':id')
  getHabitDetail(@Req() req: any, @Param('id') habitId: string) {
    return this.habitsService.getHabitDetail(req.user.id, habitId);
  }

  @Post('select')
  selectHabits(@Req() req: any, @Body() dto: SelectHabitsDto) {
    return this.habitsService.selectHabits(req.user.id, dto);
  }

  @Post(':id/complete')
  completeHabit(@Req() req: any, @Param('id') habitId: string) {
    return this.habitsService.completeHabit(req.user.id, habitId);
  }

  @Delete(':id/complete')
  uncompleteHabit(@Req() req: any, @Param('id') habitId: string) {
    return this.habitsService.uncompleteHabit(req.user.id, habitId);
  }
}
