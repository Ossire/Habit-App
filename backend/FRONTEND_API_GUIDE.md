# HabitUp — Frontend API Reference Guide
This document covers every backend endpoint available for you to wire up.
Base URL: `http://localhost:3000`
All protected routes require: `Authorization: Bearer <token>`

---

## Auth (Not your concern — already wired by auth engineer)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns `accessToken` |

The token is stored in `localStorage` automatically via `AuthService`.
The `authInterceptor` attaches it to every request automatically — you don't need to manually add headers.

---

## Users

### GET /users/profile
Returns the logged-in user's profile.

**Response:**
```json
{
  "id": "uuid",
  "fullName": "Alex Johnson",
  "school": "University of Life",
  "email": "alex@test.com",
  "createdAt": "2026-06-26T08:38:04.975Z",
  "updatedAt": "2026-06-26T08:38:04.975Z"
}
```

---

### PATCH /users/profile
Update the logged-in user's name and/or school.

**Request body:**
```json
{
  "fullName": "Alex Updated",
  "school": "New School"
}
```

**Response:** Updated user object (same shape as GET /users/profile)

---

### PATCH /users/change-password
Change the logged-in user's password.

**Request body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{ "message": "Password updated successfully" }
```

**Error (wrong current password):**
```json
{ "message": "Current password is incorrect.", "statusCode": 400 }
```

---

## Habits

### GET /habits/system
Returns all 6 pre-seeded system habits for the onboarding screen.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Drink Water",
    "description": "8 glasses daily",
    "category": "Health",
    "icon": "drop",
    "isSystem": true,
    "trackingType": "toggle",
    "dailyTarget": null,
    "targetUnit": null
  },
  ...
]
```

---

### POST /habits/select
Save the habits the user picked during onboarding.
Creates personal copies of the selected system habits for the user.

**Request body:**
```json
{
  "habitIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** Array of the user's newly created habit objects.

---

### GET /habits/dashboard
Returns today's habits with completion status and progress summary.

**Response:**
```json
{
  "date": "2026-07-01",
  "progressPercentage": 33,
  "completedCount": 1,
  "totalCount": 3,
  "habits": [
    {
      "id": "uuid",
      "name": "Drink Water",
      "description": "8 glasses daily",
      "category": "Health",
      "icon": "drop",
      "trackingType": "toggle",
      "dailyTarget": null,
      "targetUnit": null,
      "completedToday": true,
      "loggedValue": null
    },
    {
      "id": "uuid",
      "name": "Push Ups",
      "description": "Daily strength",
      "category": "Fitness",
      "icon": "default",
      "trackingType": "count",
      "dailyTarget": 30,
      "targetUnit": "reps",
      "completedToday": false,
      "loggedValue": 20
    }
  ]
}
```

**Notes:**
- `completedToday` — use this to show the checkbox state
- `loggedValue` — for count/duration habits, shows how much has been logged today (even if target not reached yet)
- `progressPercentage` — use this for the circular progress ring

---

### POST /habits
Create a custom habit from the "Quick Add Habit" modal.

**Request body:**
```json
{
  "name": "Push Ups",
  "description": "Daily strength",
  "category": "Fitness",
  "icon": "default",
  "trackingType": "count",
  "dailyTarget": 30,
  "targetUnit": "reps"
}
```

**Tracking types:** `toggle` | `count` | `duration` | `timer`

**Response:** The newly created habit object.

**Notes:**
- `trackingType` defaults to `toggle` if not sent
- `dailyTarget` and `targetUnit` are optional — only needed for count/duration/timer habits
- After creating, call `GET /habits/dashboard` to refresh the list

---

### POST /habits/:id/complete
Mark a **toggle** or **timer** habit as done for today.

**No request body needed.**

**Response:**
```json
{ "message": "Habit completed" }
```

**Error (if used on count/duration habit):**
```json
{ "message": "Use POST /habits/:id/log for count and duration habits", "statusCode": 400 }
```

---

### DELETE /habits/:id/complete
Unmark a habit (toggle it off).

**No request body needed.**

**Response:**
```json
{ "message": "Habit uncompleted" }
```

---

### POST /habits/:id/log
Log a value for **count** or **duration** habits.
Can be called multiple times — updates the value if already logged today.

**Request body:**
```json
{ "value": 25 }
```

**Response:**
```json
{
  "message": "Target reached!",
  "value": 30,
  "target": 30,
  "targetUnit": "reps",
  "completed": true
}
```

Or if target not yet met:
```json
{
  "message": "Progress logged",
  "value": 20,
  "target": 30,
  "targetUnit": "reps",
  "completed": false
}
```

**Notes:**
- Use `completed` from the response to update the UI immediately
- For timer habits — when the timer finishes, call `POST /habits/:id/complete` instead

---

### GET /habits/:id
Returns full detail for a single habit — streak, weekly activity grid, tracking info.

**Response:**
```json
{
  "id": "uuid",
  "name": "Drink Water",
  "description": "8 glasses daily",
  "category": "Health",
  "icon": "drop",
  "trackingType": "toggle",
  "dailyTarget": null,
  "targetUnit": null,
  "currentStreak": 1,
  "weeklyActivity": [
    { "date": "2026-06-25", "completed": false, "value": null },
    { "date": "2026-06-26", "completed": false, "value": null },
    { "date": "2026-06-27", "completed": false, "value": null },
    { "date": "2026-06-28", "completed": false, "value": null },
    { "date": "2026-06-29", "completed": false, "value": null },
    { "date": "2026-06-30", "completed": false, "value": null },
    { "date": "2026-07-01", "completed": true, "value": null }
  ]
}
```

**Notes:**
- `weeklyActivity` is always 7 items — Mon to Sun of the current week
- `value` in weeklyActivity shows what was logged that day (useful for count/duration habits)

---

### GET /habits/progress
Returns habit performance stats for the progress/analytics screen.

**Response:**
```json
{
  "strongHabits": [
    {
      "id": "uuid",
      "name": "Drink Water",
      "icon": "drop",
      "category": "Health",
      "consistency": 95,
      "streak": 12,
      "status": "LOW_CONSISTENCY",
      "completedToday": true
    }
  ],
  "needsAttention": [
    {
      "id": "uuid",
      "name": "Go for a Run",
      "icon": "run",
      "category": "Fitness",
      "consistency": 0,
      "streak": 0,
      "status": "STAGNANT",
      "completedToday": false
    }
  ],
  "monthlyTrend": [
    { "label": "W1", "completions": 0 },
    { "label": "W2", "completions": 0 },
    { "label": "W3", "completions": 0 },
    { "label": "W4", "completions": 1 }
  ],
  "domainMastery": [
    { "category": "Health", "consistency": 85, "totalHabits": 2, "completedToday": 1 },
    { "category": "Fitness", "consistency": 42, "totalHabits": 1, "completedToday": 0 },
    { "category": "Study", "consistency": 0, "totalHabits": 1, "completedToday": 0 }
  ]
}
```

**Status values for needsAttention:**
- `MISSED_3_DAYS` — habit exists but not completed in 3+ days → show "MISSED 3 DAYS" badge
- `STAGNANT` — never completed or consistency below 20% → show "STAGNANT" badge
- `LOW_CONSISTENCY` — below 90% but recently active → no special badge needed

**domainMastery** — use this for the "YOUR DOMAINS" section on dashboard and domain mastery bars on progress screen.

---

### GET /habits/heatmap
Returns 84 days of activity data for the heatmap grid.

**Response:**
```json
{
  "grid": [
    { "date": "2026-04-08", "count": 0, "intensity": 0 },
    { "date": "2026-04-09", "count": 0, "intensity": 0 },
    ...
    { "date": "2026-07-01", "count": 2, "intensity": 2 }
  ]
}
```

**Intensity values:**
- `0` — no activity
- `1` — 1 habit completed
- `2` — 2 habits completed
- `3` — 3+ habits completed

**Notes:**
- Always 84 items (12 weeks)
- Slice for weekly view: `grid.slice(-7)`
- Slice for monthly view: `grid.slice(-28)`
- Full array = annual view

---

## How Tracking Types Affect the UI

| Tracking Type | How to complete | UI element needed |
|---------------|----------------|-------------------|
| `toggle` | `POST /habits/:id/complete` | Checkbox / tap to complete |
| `timer` | `POST /habits/:id/complete` | Countdown timer, auto-completes |
| `count` | `POST /habits/:id/log` with value | Number input + log button |
| `duration` | `POST /habits/:id/log` with value | Number input + unit label |

**For the dashboard habit list:**
- If `trackingType === 'toggle'` → show checkbox
- If `trackingType === 'count'` → show `loggedValue / dailyTarget reps` and a log button
- If `trackingType === 'duration'` → show `loggedValue / dailyTarget minutes` and a log button
- If `trackingType === 'timer'` → show a timer button that counts down from `dailyTarget`

---

## Angular Service Methods to Add

Add these to `src/app/services/habits.service.ts`:

```typescript
// Already exists — keeping for reference
getSystemHabits(): Observable<Habit[]>
selectHabits(habitIds: string[]): Observable<Habit[]>
getDashboard(): Observable<DashboardResponse>
completeHabit(habitId: string): Observable<{ message: string }>
uncompleteHabit(habitId: string): Observable<{ message: string }>
getHabitDetail(habitId: string): Observable<HabitDetail>
getProgress(): Observable<any>
getHeatmap(): Observable<any>
hasUserHabits(): Observable<boolean>

// New — add these
createHabit(dto: CreateHabitDto): Observable<Habit>
logHabit(habitId: string, value: number): Observable<LogResponse>
updateProfile(dto: UpdateProfileDto): Observable<User>
changePassword(dto: ChangePasswordDto): Observable<{ message: string }>
```

**Add to habits.service.ts:**
```typescript
createHabit(dto: any): Observable<any> {
  return this.http.post(`${this.apiUrl}`, dto);
}

logHabit(habitId: string, value: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/${habitId}/log`, { value });
}
```

**Add to auth.service.ts:**
```typescript
updateProfile(dto: { fullName?: string; school?: string }): Observable<any> {
  return this.http.patch('http://localhost:3000/users/profile', dto).pipe(
    tap((updatedUser) => {
      // Update the stored user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }),
  );
}

changePassword(dto: { currentPassword: string; newPassword: string }): Observable<any> {
  return this.http.patch('http://localhost:3000/users/change-password', dto);
}
```

---

## Error Handling Pattern

All endpoints return errors in this shape:
```json
{
  "message": "Error description here",
  "statusCode": 400
}
```

Common status codes:
- `400` — Bad request (wrong data sent)
- `401` — Unauthorized (token missing or expired → redirect to login)
- `404` — Not found
- `409` — Conflict (e.g. email already exists)

Standard error handling pattern in Angular:
```typescript
this.habitsService.someMethod().subscribe({
  next: (data) => {
    // handle success
  },
  error: (err: HttpErrorResponse) => {
    this.errorMessage.set(err.error?.message || 'Something went wrong');
  },
});
```

---

## Files You Own (Do Not Touch Backend)

```
src/app/pages/dashboard/*
src/app/pages/progress/*
src/app/pages/settings/*
src/app/pages/heatmap/*
src/app/pages/habit-detail/*
src/app/pages/onboarding/*
src/app/services/habits.service.ts
src/styles.css
```

## Files Osi Owns (Do Not Touch)

```
src/habits/*
src/users/*
src/auth/*
```

## Shared — Coordinate Before Touching

```
src/app/services/auth.service.ts
src/app/app.routes.ts
```
