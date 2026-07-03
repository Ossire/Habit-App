import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationsService, Notification } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  private notificationsService = inject(NotificationsService);

  notifications = signal<Notification[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.notificationsService.getAll().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
        // Mark all as read when page is opened
        this.notificationsService.markAllAsRead().subscribe();
      },
      error: () => this.isLoading.set(false),
    });
  }
}