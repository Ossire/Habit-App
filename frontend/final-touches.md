# HabitUp — Frontend Remaining Tasks + DB Seeding Guide

---

# PART 1 — Frontend Remaining Tasks

## 1. Update HabitsService interfaces and add missing methods

Replace `src/app/services/habits.service.ts` with:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  trackingType: string; // 'toggle' | 'count' | 'duration' | 'timer'
  dailyTarget: number | null;
  targetUnit: string | null;
  completedToday?: boolean;
  loggedValue?: number | null;
}

export interface DashboardResponse {
  date: string;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  habits: Habit[];
}

export interface HabitDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  trackingType: string;
  dailyTarget: number | null;
  targetUnit: string | null;
  currentStreak: number;
  weeklyActivity: { date: string; completed: boolean; value: number | null }[];
}

export interface ProgressHabit {
  id: string;
  name: string;
  icon: string;
  category: string;
  consistency: number;
  streak: number;
  status: string; // 'MISSED_3_DAYS' | 'STAGNANT' | 'LOW_CONSISTENCY'
  completedToday: boolean;
}

export interface MonthlyTrend {
  label: string;
  completions: number;
}

export interface DomainMastery {
  category: string;
  consistency: number;
  totalHabits: number;
  completedToday: number;
}

export interface ProgressResponse {
  strongHabits: ProgressHabit[];
  needsAttention: ProgressHabit[];
  monthlyTrend: MonthlyTrend[];
  domainMastery: DomainMastery[];
}

export interface CreateHabitDto {
  name: string;
  description?: string;
  category: string;
  icon?: string;
  trackingType?: string;
  dailyTarget?: number;
  targetUnit?: string;
}

export interface LogHabitResponse {
  message: string;
  value: number;
  target: number;
  targetUnit: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/habits';

  hasUserHabits(): Observable<boolean> {
    return this.getDashboard().pipe(map((data) => data.totalCount > 0));
  }

  getSystemHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}/system`);
  }

  selectHabits(habitIds: string[]): Observable<Habit[]> {
    return this.http.post<Habit[]>(`${this.apiUrl}/select`, { habitIds });
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  completeHabit(habitId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${habitId}/complete`, {});
  }

  uncompleteHabit(habitId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${habitId}/complete`);
  }

  // For count and duration habits — logs a numeric value
  logHabit(habitId: string, value: number): Observable<LogHabitResponse> {
    return this.http.post<LogHabitResponse>(`${this.apiUrl}/${habitId}/log`, { value });
  }

  getHabitDetail(habitId: string): Observable<HabitDetail> {
    return this.http.get<HabitDetail>(`${this.apiUrl}/${habitId}`);
  }

  getProgress(): Observable<ProgressResponse> {
    return this.http.get<ProgressResponse>(`${this.apiUrl}/progress`);
  }

  getHeatmap(): Observable<any> {
    return this.http.get(`${this.apiUrl}/heatmap`);
  }

  // Create a custom habit from the Quick Add modal
  createHabit(dto: CreateHabitDto): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}`, dto);
  }
}
```

---

## 2. Add missing methods to UserService

Replace `src/app/services/user.service.ts` with:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  fullName: string;
  school: string;
  email: string;
  dailyReminders: boolean;
  streakAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  school?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferencesDto {
  dailyReminders?: boolean;
  streakAlerts?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(payload: UpdateProfileDto): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/profile`, payload);
  }

  changePassword(payload: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/change-password`, payload);
  }

  updateNotificationPreferences(payload: NotificationPreferencesDto): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/notifications`, payload);
  }
}
```

---

## 3. Create NotificationsService

Create `src/app/services/notifications.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/notifications';

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {});
  }
}
```

---

## 4. Wire notification preferences toggles in Settings

In `src/app/pages/settings/settings.ts`, inject `UserService` and wire the
toggles to actually save to the backend:

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

const ALL_INTERESTS = [
  'Health',
  'Productivity',
  'Reading',
  'Coding',
  'Running',
  'Fitness',
  'Mindfulness',
  'Study',
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  user = signal<any>(null);
  isLoading = signal(true);
  dailyReminders = signal(true);
  streakAlerts = signal(false);

  allInterests = ALL_INTERESTS;
  selectedInterests = signal<Set<string>>(new Set(['Health', 'Productivity', 'Reading']));

  ngOnInit() {
    const saved = localStorage.getItem('interests');
    if (saved) {
      this.selectedInterests.set(new Set(JSON.parse(saved) as string[]));
    }

    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user.set(data);
        this.dailyReminders.set(data.dailyReminders);
        this.streakAlerts.set(data.streakAlerts);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleDailyReminders() {
    const newValue = !this.dailyReminders();
    this.dailyReminders.set(newValue);
    this.userService.updateNotificationPreferences({ dailyReminders: newValue }).subscribe();
  }

  toggleStreakAlerts() {
    const newValue = !this.streakAlerts();
    this.streakAlerts.set(newValue);
    this.userService.updateNotificationPreferences({ streakAlerts: newValue }).subscribe();
  }

  toggleInterest(interest: string) {
    this.selectedInterests.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      localStorage.setItem('interests', JSON.stringify([...newSet]));
      return newSet;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

Update `settings.html` toggles to use the new methods:

```html
<!-- Daily Reminders toggle row -->
<div class="toggle-row">
  <div class="toggle-info">
    <p class="toggle-title">Daily Reminders</p>
    <p class="toggle-desc">Get nudged to complete your habits</p>
  </div>
  <div class="toggle" [class.on]="dailyReminders()" (click)="toggleDailyReminders()">
    <div class="toggle-thumb"></div>
  </div>
</div>

<!-- Streak Alerts toggle row -->
<div class="toggle-row">
  <div class="toggle-info">
    <p class="toggle-title">Streak Alerts</p>
    <p class="toggle-desc">Don't lose your progress</p>
  </div>
  <div class="toggle" [class.on]="streakAlerts()" (click)="toggleStreakAlerts()">
    <div class="toggle-thumb"></div>
  </div>
</div>
```

---

## 5. Add notification bell to dashboard header

In `src/app/pages/dashboard/dashboard.ts` add:

```typescript
import { NotificationsService } from '../../services/notifications.service';

// inside the class
private notificationsService = inject(NotificationsService);
unreadCount = signal(0);

// inside ngOnInit or loadDashboard
this.notificationsService.getUnreadCount().subscribe({
  next: (data) => this.unreadCount.set(data.count),
  error: () => {},
});
```

In `dashboard.html` header add a bell icon:

```html
<div class="header-actions">
  <button class="bell-btn" routerLink="/notifications">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      width="24"
      height="24"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
    @if (unreadCount() > 0) {
    <span class="bell-badge">{{ unreadCount() }}</span>
    }
  </button>
</div>
```

Add to `dashboard.css`:

```css
.header-actions {
  position: relative;
}

.bell-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 4px;
}

.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #000;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 6. Create Notifications page

Create `src/app/pages/notifications/notifications.ts`:

```typescript
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
```

Create `src/app/pages/notifications/notifications.html`:

```html
<div class="page-wrapper">
  <div class="mobile-container">
    <header class="header">
      <button class="icon-btn" routerLink="/dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <h1>Notifications</h1>
      <div style="width: 24px;"></div>
    </header>

    @if (isLoading()) {
    <p style="padding: 2rem; text-align: center;">Loading...</p>
    } @else if (notifications().length === 0) {
    <p style="padding: 2rem; text-align: center; color: #666;">
      No notifications yet. Keep building those habits!
    </p>
    } @else {
    <div class="notifications-list">
      @for (n of notifications(); track n.id) {
      <div class="notification-card" [class.unread]="!n.isRead">
        <div class="notif-icon">
          @if (n.type === 'daily_reminder') { 🌅 } @else if (n.type === 'streak_alert') { 🔥 } @else
          { 🏆 }
        </div>
        <div class="notif-body">
          <p class="notif-title">{{ n.title }}</p>
          <p class="notif-message">{{ n.message }}</p>
          <p class="notif-time">{{ n.createdAt | date: 'MMM d, h:mm a' }}</p>
        </div>
      </div>
      }
    </div>
    }
  </div>
</div>
```

Create `src/app/pages/notifications/notifications.css`:

```css
.page-wrapper {
  min-height: 100vh;
  background-color: #1a1a1a;
  display: flex;
  justify-content: center;
}

.mobile-container {
  width: 100%;
  max-width: 400px;
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #000;
  background-color: #fff;
}

.header h1 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #000;
  width: 24px;
  height: 24px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-card {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.notification-card.unread {
  background-color: #f0f0f0;
  border-left: 3px solid #000;
}

.notif-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notif-body {
  flex: 1;
}

.notif-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.25rem;
}

.notif-message {
  font-size: 0.75rem;
  color: #444;
  margin: 0 0 0.25rem;
  line-height: 1.4;
}

.notif-time {
  font-size: 0.65rem;
  color: #888;
  margin: 0;
}
```

---

## 7. Add notifications route to app.routes.ts

```typescript
{
  path: 'notifications',
  loadComponent: () =>
    import('./pages/notifications/notifications').then(
      (m) => m.NotificationsComponent,
    ),
  canActivate: [authGuard],
},
```

---

## 8. Verify these routes exist in app.routes.ts

Make sure these are all present:

```typescript
{ path: 'edit-profile', loadComponent: () => import('./pages/edit-profile/edit-profile').then(m => m.EditProfileComponent), canActivate: [authGuard] },
{ path: 'change-password', loadComponent: () => import('./pages/change-password/change-password').then(m => m.ChangePasswordComponent), canActivate: [authGuard] },
{ path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsComponent), canActivate: [authGuard] },
```

---

---

# PART 2 — DB Seeding Script (Rich Demo Data)

This script creates 10 users with habits, logs spanning 60 days, streaks,
and varied consistency so the heatmap, progress, and stats screens
all look rich during the demo.

## Step 1 — Install axios for the script

```bash
npm install axios
```

---

## Step 2 — Create the seed script

Create `scripts/seed-demo-data.js` in your backend project root:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 10 demo users
const USERS = [
  {
    fullName: 'Alex Johnson',
    school: 'University of Life',
    email: 'alex@demo.com',
    password: 'password123',
  },
  { fullName: 'Sam Smith', school: 'MIT', email: 'sam@demo.com', password: 'password123' },
  { fullName: 'Jordan Lee', school: 'Stanford', email: 'jordan@demo.com', password: 'password123' },
  {
    fullName: 'Taylor Brown',
    school: 'Harvard',
    email: 'taylor@demo.com',
    password: 'password123',
  },
  { fullName: 'Morgan Davis', school: 'Oxford', email: 'morgan@demo.com', password: 'password123' },
  {
    fullName: 'Casey Wilson',
    school: 'Cambridge',
    email: 'casey@demo.com',
    password: 'password123',
  },
  { fullName: 'Riley Martinez', school: 'Yale', email: 'riley@demo.com', password: 'password123' },
  {
    fullName: 'Drew Anderson',
    school: 'Columbia',
    email: 'drew@demo.com',
    password: 'password123',
  },
  {
    fullName: 'Quinn Thomas',
    school: 'Princeton',
    email: 'quinn@demo.com',
    password: 'password123',
  },
  { fullName: 'Avery Jackson', school: 'Duke', email: 'avery@demo.com', password: 'password123' },
];

// Helper — get a date string N days ago
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Helper — sleep between requests to avoid overwhelming the server
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper — random int between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function registerUser(user) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, user);
    console.log(`✅ Registered: ${user.fullName}`);
    return res.data.access_token;
  } catch (e) {
    // User might already exist — try login instead
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password,
      });
      console.log(`🔄 Already exists, logged in: ${user.fullName}`);
      return res.data.access_token;
    } catch (err) {
      console.error(`❌ Failed for ${user.fullName}:`, err.message);
      return null;
    }
  }
}

async function getSystemHabits(token) {
  const res = await axios.get(`${BASE_URL}/habits/system`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

async function selectHabits(token, habitIds) {
  try {
    await axios.post(
      `${BASE_URL}/habits/select`,
      { habitIds },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (e) {
    // Already selected — ignore
  }
}

async function getDashboard(token) {
  const res = await axios.get(`${BASE_URL}/habits/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

async function completeHabitOnDate(token, habitId, date) {
  // We use the log endpoint with a backdated date via direct DB approach
  // Since the API only supports today, we'll complete today and the
  // seeding script will handle the rest via the log endpoint pattern
  try {
    await axios.post(
      `${BASE_URL}/habits/${habitId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (e) {
    // Already completed — ignore
  }
}

async function seedUser(user) {
  console.log(`\n🌱 Seeding user: ${user.fullName}`);

  // 1. Register or login
  const token = await registerUser(user);
  if (!token) return;

  await sleep(300);

  // 2. Get system habits
  const systemHabits = await getSystemHabits(token);

  // 3. Each user selects a different combination of habits
  // to create variety in the data
  const allIds = systemHabits.map((h) => h.id);
  const numToSelect = randInt(3, 6);
  const shuffled = allIds.sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, numToSelect);

  await selectHabits(token, selectedIds);
  await sleep(300);

  // 4. Get their dashboard to get user-specific habit IDs
  const dashboard = await getDashboard(token);
  const userHabits = dashboard.habits;

  console.log(`   Selected ${userHabits.length} habits`);

  // 5. Complete habits for today to populate heatmap and streak
  // Each habit gets completed with different frequency to create
  // varied consistency scores
  for (const habit of userHabits) {
    // Randomly decide consistency level for this habit per user
    // High consistency (80-100% days) | Medium (40-70%) | Low (0-30%)
    const consistencyType = randInt(1, 3);
    const completionChance = consistencyType === 1 ? 0.9 : consistencyType === 2 ? 0.55 : 0.2;

    let completedCount = 0;

    // Go back 60 days and complete habit based on chance
    for (let i = 0; i < 60; i++) {
      if (Math.random() < completionChance) {
        completedCount++;
        // For today specifically, call the API
        if (i === 0) {
          await completeHabitOnDate(token, habit.id, daysAgo(i));
          await sleep(100);
        }
      }
    }

    console.log(
      `   ${habit.name}: ~${Math.round(completionChance * 100)}% consistency (${completedCount}/60 days simulated)`,
    );
  }
}

async function main() {
  console.log('🚀 Starting demo data seed...\n');

  for (const user of USERS) {
    await seedUser(user);
    await sleep(500);
  }

  console.log('\n✅ Demo seed complete!');
  console.log('\nLogin credentials for all demo users:');
  console.log('Password: password123');
  USERS.forEach((u) => console.log(`  ${u.email}`));
}

main().catch(console.error);
```

---

## Step 3 — Run the script

Make sure your backend is running first, then:

```bash
node scripts/seed-demo-data.js
```

---

## Step 4 — Manually backdate logs for rich heatmap data

The script above completes habits for today via the API. To get rich historical
data (past 60 days) in the heatmap, run this SQL directly in your PostgreSQL
database after running the seed script.

Open your DB client (pgAdmin, TablePlus, DBeaver, or psql) and run:

```sql
-- This inserts backdated habit logs for all users
-- for the past 60 days with varied completion patterns

DO $$
DECLARE
  habit_record RECORD;
  day_offset INT;
  log_date DATE;
  completion_chance FLOAT;
  random_val FLOAT;
BEGIN
  -- Loop through every user habit
  FOR habit_record IN
    SELECT h.id as habit_id, h."userId"
    FROM habits h
    WHERE h."isSystem" = false
  LOOP
    -- Assign a random consistency level per habit
    completion_chance := 0.3 + random() * 0.65; -- between 30% and 95%

    -- Loop through past 60 days
    FOR day_offset IN 1..60 LOOP
      log_date := CURRENT_DATE - day_offset;
      random_val := random();

      -- Only insert if random chance hit AND log doesn't already exist
      IF random_val < completion_chance THEN
        INSERT INTO habit_logs ("userId", "habitId", date, value, "completedAt")
        VALUES (
          habit_record."userId",
          habit_record.habit_id,
          log_date,
          NULL,
          log_date + INTERVAL '8 hours'
        )
        ON CONFLICT ("userId", "habitId", date) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Backdated logs inserted successfully';
END $$;
```

---

## Step 5 — Verify the data

Run these queries to confirm data looks good:

```sql
-- Count logs per user
SELECT u."fullName", COUNT(hl.id) as total_logs
FROM users u
LEFT JOIN habit_logs hl ON hl."userId" = u.id
GROUP BY u.id, u."fullName"
ORDER BY total_logs DESC;

-- Check heatmap spread (logs per day)
SELECT date, COUNT(*) as completions
FROM habit_logs
WHERE date >= CURRENT_DATE - 60
GROUP BY date
ORDER BY date DESC
LIMIT 20;

-- Check habit count per user
SELECT u."fullName", COUNT(h.id) as habit_count
FROM users u
LEFT JOIN habits h ON h."userId" = u.id AND h."isSystem" = false
GROUP BY u.id, u."fullName";
```

---

## Demo Login Credentials

| Name           | Email           | Password    |
| -------------- | --------------- | ----------- |
| Alex Johnson   | alex@demo.com   | password123 |
| Sam Smith      | sam@demo.com    | password123 |
| Jordan Lee     | jordan@demo.com | password123 |
| Taylor Brown   | taylor@demo.com | password123 |
| Morgan Davis   | morgan@demo.com | password123 |
| Casey Wilson   | casey@demo.com  | password123 |
| Riley Martinez | riley@demo.com  | password123 |
| Drew Anderson  | drew@demo.com   | password123 |
| Quinn Thomas   | quinn@demo.com  | password123 |
| Avery Jackson  | avery@demo.com  | password123 |

---

## Quick Demo Flow for Presentation

1. Login as **Alex Johnson** — show dashboard with habits and progress ring
2. Complete a habit — show progress update live
3. Navigate to habit detail — show streak and weekly activity
4. Go to progress — show domain mastery and strong/weak habits
5. Go to heatmap — show 60 days of rich activity data
6. Go to settings — toggle notifications, show interests
7. Logout — login as **Sam Smith** — show different data for different user
8. Show notifications bell if any unread count exists
