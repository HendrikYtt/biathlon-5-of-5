# 🎯 Biathlon 5 of 5

Biathlon 5 of 5 was a biathlon prediction application that processed over **10,000 user predictions**.

The platform automatically calculated results and updated leaderboards without any manual work needed.
Users could make predictions on over 50 different markets:

**Race outcomes**: Pick winners, podium finishers, and performance rankings, etc.

**Shooting performance**: Predict penalties, shooting times, and accuracy, etc.

**Time-based markets**: Fastest splits, lap times, and overall performance, etc.

---

## Features

- Make predictions before each biathlon event starts
- Create private leagues with friends or join public ones
- Watch your ranking change as races unfold
- Predict everything from race winners to shooting penalties
- Works great on mobile - perfect for watching races
- Clean admin interface for creating new prediction markets
- Automatic integration with biathlon race data
- Real-time leaderboard updates
- User analytics and engagement tracking

---

## How it's built

**Frontend**: Next.js 14 with TypeScript, styled with Tailwind CSS and DaisyUI components

**Backend**: Supabase (PostgreSQL) with authentication, plus a solid API architecture organized by features

**Key integrations**:
- External biathlon API for live race data
- Stripe for payments
- Mailgun for emails
- Plausible for privacy-focused analytics

**Hosted on**: Vercel with automated deployments

---

## Getting started

You'll need Node.js 18+ and a Supabase account.

```bash
# Clone and install
git clone https://github.com/your-username/biathlon-app-v2.git
cd biathlon-app-v2
npm install

# Start development
npm run dev
```

**Available commands**:
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Run production server
npm run lint       # Check code quality
npm run lint:fix   # Fix linting issues
```
