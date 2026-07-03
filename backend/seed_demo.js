const https = require('http');
const { Client } = require('pg');

const BASE_URL = 'http://localhost:3000';

const USERS = [
  {
    fullName: 'Alex Johnson',
    school: 'University of Life',
    email: 'alex@demo.com',
    password: 'demo123',
  },
  {
    fullName: 'Sam Smith',
    school: 'MIT',
    email: 'sam@demo.com',
    password: 'demo123',
  },
  {
    fullName: 'Jordan Lee',
    school: 'Stanford',
    email: 'jordan@demo.com',
    password: 'demo123',
  },
];

const PROFILES = {
  'Alex Johnson': [0.95, 0.9, 0.85, 0.8, 0.75, 0.7],
  'Sam Smith': [0.8, 0.75, 0.5, 0.4, 0.85, 0.6],
  'Jordan Lee': [0.6, 0.3, 0.9, 0.2, 0.7, 0.5],
};

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

async function registerOrLogin(user) {
  let res = await request('POST', '/auth/register', user);
  let token = res.access_token || res.accessToken;
  if (token) {
    console.log(`  ✅ Registered: ${user.fullName}`);
    return token;
  }

  res = await request('POST', '/auth/login', {
    email: user.email,
    password: user.password,
  });
  token = res.access_token || res.accessToken;
  if (token) {
    console.log(`  🔄 Logged in: ${user.fullName}`);
    return token;
  }

  console.log(`  ❌ Failed: ${user.fullName}`, res);
  return null;
}

async function main() {
  console.log('\n🌱 Seeding demo users...\n');

  const userData = [];

  for (const user of USERS) {
    const token = await registerOrLogin(user);
    if (!token) continue;

    const systemHabits = await request('GET', '/habits/system', null, token);
    const allIds = systemHabits.slice(0, 5).map((h) => h.id);
    await request('POST', '/habits/select', { habitIds: allIds }, token);

    const dashboard = await request('GET', '/habits/dashboard', null, token);
    const habitIds = (dashboard.habits || []).map((h) => h.id);

    const profile = await request('GET', '/users/profile', null, token);
    const userId = profile.id;

    console.log(
      `  📋 ${user.fullName} — ${habitIds.length} habits | userId: ${userId.slice(0, 8)}...`,
    );
    userData.push({ name: user.fullName, userId, habitIds });
  }

  console.log('\n💾 Inserting backdated logs via PostgreSQL...\n');

  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Habit-up',
    user: 'postgres',
    password: 'thesingularity',
  });

  await client.connect();

  let inserted = 0;
  let skipped = 0;

  for (const ud of userData) {
    const profile = PROFILES[ud.name] || [];
    console.log(`  Seeding ${ud.name}...`);

    for (let idx = 0; idx < ud.habitIds.length; idx++) {
      const habitId = ud.habitIds[idx];
      const chance = profile[idx] ?? 0.6;

      for (let daysBack = 1; daysBack <= 84; daysBack++) {
        const logDate = daysAgo(daysBack);
        const dayOfWeek = new Date(logDate).getDay();
        const adjusted =
          dayOfWeek === 0 || dayOfWeek === 6 ? chance * 0.8 : chance;

        if (Math.random() < adjusted) {
          try {
            await client.query(
              `INSERT INTO habit_logs ("userId", "habitId", date, value, "completedAt")
               VALUES ($1, $2, $3, NULL, $4)
               ON CONFLICT ("userId", "habitId", date) DO NOTHING`,
              [ud.userId, habitId, logDate, `${logDate} 08:00:00`],
            );
            inserted++;
          } catch (e) {
            skipped++;
          }
        }
      }
    }
  }

  await client.end();

  console.log(`\n  ✅ Inserted ${inserted} logs, skipped ${skipped} conflicts`);
  console.log('\n🎉 Done!\n');
  console.log('┌──────────────────────────────────────┐');
  console.log('│        DEMO LOGIN CREDENTIALS        │');
  console.log('├──────────────────────────────────────┤');
  console.log('│  alex@demo.com    │  demo123         │');
  console.log('│  sam@demo.com     │  demo123         │');
  console.log('│  jordan@demo.com  │  demo123         │');
  console.log('└──────────────────────────────────────┘');
  console.log('\nAlex   — very consistent  (streaks + full heatmap)');
  console.log('Sam    — mixed            (needs attention demo)');
  console.log('Jordan — varied           (heatmap contrast)\n');
}

main().catch(console.error);
