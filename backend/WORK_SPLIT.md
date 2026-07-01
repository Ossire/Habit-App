# HabitUp — Work Split
**Deadline:** Tomorrow evening
**Team:** Osi (Backend) + Teammate (Frontend)

---

## API Contract (Agree on this first before building)

These are the request/response shapes both sides must honour.

### PATCH /users/profile
```json
// Request
{ "fullName": "Alex Johnson", "school": "University of Life" }

// Response
{ "id": "uuid", "fullName": "Alex Johnson", "school": "University of Life", "email": "..." }
```

### PATCH /users/change-password
```json
// Request
{ "currentPassword": "oldpass", "newPassword": "newpass" }

// Response
{ "message": "Password updated successfully" }
```

### GET /habits/progress (extended)
```json
// Response (additions to existing shape)
{
  "strongHabits": [...],
  "needsAttention": [...],
  "monthlyTrend": [...],
  "domainMastery": [
    { "category": "Health", "consistency": 85, "totalHabits": 2, "completedToday": 1 },
    { "category": "Fitness", "consistency": 42, "totalHabits": 1, "completedToday": 0 }
  ]
}
```

### POST /habits (add custom habit)
```json
// Request
{ "name": "Deep Work", "description": "2 hours focused", "category": "Study", "icon": "book" }

// Response
{ "id": "uuid", "name": "Deep Work", "description": "...", "category": "Study", "icon": "book" }
```

### GET /habits/progress (missed/stagnant flags)
```json
// needsAttention items will now include a status field
{
  "needsAttention": [
    { "id": "uuid", "name": "Go for a Run", "streak": 0, "consistency": 42, "status": "MISSED_3_DAYS" },
    { "id": "uuid", "name": "Meditate", "streak": 0, "consistency": 10, "status": "STAGNANT" }
  ]
}
```

---

## Osi — Backend

### Priority 1 — Edit Profile & Change Password
**Files to touch:**
- `src/users/users.service.ts` — add `updateProfile()` and `changePassword()` methods
- `src/users/users.controller.ts` — add `PATCH /users/profile` and `PATCH /users/change-password` endpoints
- `src/users/dto/update-user.dto.ts` — already exists, add fields if needed

**Done when:** Postman returns updated user on PATCH /users/profile

---

### Priority 2 — Domain Mastery on Progress Endpoint
**Files to touch:**
- `src/habits/habits.service.ts` — extend `getProgress()` to group by category and compute per-category consistency
- No controller change needed — same endpoint, extended response

**Done when:** GET /habits/progress returns `domainMastery` array

---

### Priority 3 — Add Custom Habit
**Files to touch:**
- `src/habits/habits.service.ts` — add `createHabit()` method
- `src/habits/habits.controller.ts` — add `POST /habits` endpoint
- `src/habits/dto/create-habit.dto.ts` — already exists, verify fields

**Done when:** POST /habits creates a habit linked to the logged-in user

---

### Priority 4 — Missed / Stagnant Status Flags
**Files to touch:**
- `src/habits/habits.service.ts` — extend `needsAttention` items to include a `status` field
  - `MISSED_3_DAYS` = no log in last 3 days
  - `STAGNANT` = consistency below 20% with no recent activity

**Done when:** GET /habits/progress needsAttention items include `status`

---

## Teammate — Frontend

### Priority 1 — Dashboard Redesign
**Files to touch:**
- `src/app/pages/dashboard/dashboard.ts`
- `src/app/pages/dashboard/dashboard.html`
- `src/app/pages/dashboard/dashboard.css`

**Changes:**
- Replace linear progress bar with circular progress ring
- Add "YOUR DOMAINS" section — group habits by category using existing dashboard data
- Add motivational quote card (hardcoded rotation of 3-4 quotes)
- Update color scheme to match new Figma (yellow/green accents, dark mode option)
- Wire `+ ADD NEW HABIT` button to navigate to `/habit-selection`

**Done when:** Dashboard matches new Figma screens

---

### Priority 2 — Theme Selection
**Files to touch:**
- `src/app/pages/settings/settings.ts`
- `src/app/pages/settings/settings.html`
- `src/app/pages/settings/settings.css`
- `src/styles.css` — add CSS variables for Light/Dark/Vibrant themes

**Changes:**
- Add theme toggle UI (Light / Dark / Vibrant buttons)
- Save selection to localStorage
- Apply theme class to `<body>` on load

**Done when:** Switching themes changes the app appearance

---

### Priority 3 — Progress Screen Updates
**Files to touch:**
- `src/app/pages/progress/progress.ts`
- `src/app/pages/progress/progress.html`
- `src/app/pages/progress/progress.css`

**Changes:**
- Add "DOMAIN MASTERY" section using `domainMastery` from extended progress endpoint
- Add `status` badge on needs attention items (MISSED 3 DAYS / STAGNANT)
- Add "CONSISTENCY IS POWER" community card (hardcoded copy for now)

**Wait for:** Osi to finish Priority 2 and 4 before wiring domain mastery and status flags

---

### Priority 4 — Settings Screen Updates
**Files to touch:**
- `src/app/pages/settings/settings.ts`
- `src/app/pages/settings/settings.html`
- `src/app/pages/settings/settings.css`

**Changes:**
- Add Edit Profile form (calls PATCH /users/profile)
- Add Change Password form (calls PATCH /users/change-password)
- Add Manage Domains UI (frontend only for now)

**Wait for:** Osi to finish Priority 1 before wiring Edit Profile and Change Password

---

## Files Each Person Owns

| File | Owner |
|------|-------|
| `src/habits/habits.service.ts` | Osi |
| `src/habits/habits.controller.ts` | Osi |
| `src/users/users.service.ts` | Osi |
| `src/users/users.controller.ts` | Osi |
| `src/app/pages/dashboard/*` | Teammate |
| `src/app/pages/progress/*` | Teammate |
| `src/app/pages/settings/*` | Teammate |
| `src/app/services/habits.service.ts` | Teammate |
| `src/styles.css` | Teammate |

---

## Shared Files — Coordinate Before Touching

| File | Why it's shared |
|------|----------------|
| `src/app/services/auth.service.ts` | Teammate may need to add `updateProfile()` and `changePassword()` calls |
| `src/app/app.routes.ts` | If any new pages/routes are added |

**Rule:** If you need to touch a shared file, message the other person first.

---

## Git Workflow

```bash
# Osi's branch
git checkout -b feat/backend-profile-domain-mastery

# Teammate's branch
git checkout -b feat/frontend-dashboard-redesign
```

Neither person merges their own PR — review each other's work before merging.

---

## Quick Checklist Before Presentation

- [ ] Edit Profile works end to end
- [ ] Change Password works end to end
- [ ] Dashboard shows circular progress + domain grouping
- [ ] Progress shows domain mastery bars
- [ ] Needs Attention shows MISSED / STAGNANT badges
- [ ] Theme selection works
- [ ] Add New Habit works
- [ ] Logout works
- [ ] Two different user accounts demo cleanly
