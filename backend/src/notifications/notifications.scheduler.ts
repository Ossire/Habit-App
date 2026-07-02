import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(private notificationsService: NotificationsService) {}

  // Runs every day at 8:00 AM
  @Cron('0 8 * * *')
  async sendDailyReminders() {
    this.logger.log('Running daily reminders cron job...');
    await this.notificationsService.createDailyReminders();
    this.logger.log('Daily reminders sent.');
  }
}
