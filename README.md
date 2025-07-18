# 🎯 Biathlon 5 of 5

## The prediction platform that gets biathlon fans excited

Ever wondered if you could predict who'll nail those standing shots or which athlete will dominate the sprint? **Biathlon 5 of 5** is where biathlon fans come to test their knowledge and compete with friends in real-time.

**Live at**: [https://www.biathlon5of5.com/](https://www.biathlon5of5.com/)

---

## What I've built so far

I've processed over **10,000 user predictions** with 40+ active users who keep coming back for more. The platform automatically calculates results and updates leaderboards without any manual work needed - it just works.

The administrative system lets me create new prediction markets for events, and everything from data import to results calculation happens automatically. Pretty neat for a biathlon prediction platform!

---

## What makes this fun

### For players
- Make predictions before each biathlon event starts
- Create private leagues with friends or join public ones
- Watch your ranking change as races unfold
- Predict everything from race winners to shooting penalties
- Works great on mobile - perfect for watching races

### Behind the scenes
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

---

## The prediction markets

**Race outcomes**: Pick winners, podium finishers, and performance rankings

**Shooting performance**: Predict penalties, shooting times, and accuracy

**Time-based markets**: Fastest splits, lap times, and overall performance

**Advanced analytics**: Statistical markets based on historical data

---

## League system

Create private leagues with friends or join public competitions. I track seasonal championships and have an achievement system that unlocks as you get better at predicting.

---

## How this works

The whole system runs automatically - no manual score updates or result calculations needed. I pull live data from biathlon APIs, process it through my market formulas, and update everything in real-time.