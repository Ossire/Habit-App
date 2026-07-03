import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Called by the cron job every morning
  async createDailyReminders(): Promise<void> {
    // Get all users who have daily reminders turned on
    const users = await this.userRepository.find({
      where: { dailyReminders: true },
    });

    for (const user of users) {
      // Check if we already sent a reminder today to avoid duplicates
      const today = new Date().toISOString().split('T')[0];
      const alreadySent = await this.notificationRepository
        .createQueryBuilder('n')
        .where('n.userId = :userId', { userId: user.id })
        .andWhere('n.type = :type', { type: 'daily_reminder' })
        .andWhere('DATE(n.createdAt) = :today', { today })
        .getOne();

      if (alreadySent) continue;

      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: user.id,
          type: 'daily_reminder',
          title: 'Good morning!',
          message:
            "Don't forget to complete your habits today. Stay consistent!",
          isRead: false,
        }),
      );
    }
  }

  // Called when a user hits a streak milestone
  async createStreakAlert(userId: string, streak: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.streakAlerts) return;

    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId,
        type: 'streak_alert',
        title: `${streak} Day Streak!`,
        message: `You're on a ${streak}-day streak. Keep the momentum going!`,
        isRead: false,
      }),
    );
  }

  // Fetch all unread notifications for the logged in user
  async getUnread(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  // Fetch all notifications (read and unread)
  async getAll(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20, // last 20 only
    });
  }

  // Mark a single notification as read
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  // Mark all as read at once
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  // Get count of unread — used for bell badge
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }
}
