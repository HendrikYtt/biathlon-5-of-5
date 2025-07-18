# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

## Project Architecture

This is a Next.js 14 biathlon prediction platform called "Biathlon 5 of 5" that allows users to predict race outcomes and compete in leagues.

### Tech Stack
- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS with DaisyUI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with social logins
- **Payments**: Stripe integration
- **Email**: Mailgun for transactional emails
- **Analytics**: Plausible

### Key Architecture Patterns

**API Routes Structure**: All API endpoints are in `/app/api/` with feature-based organization:
- `/app/api/features/` - Core business logic organized by domain
- Each feature has `database.ts` (data layer), `service.ts` (business logic), and `route.ts` (API handlers)

**Database Layer**: Uses Supabase client with separate server/client configurations:
- `/libs/supabase/server.ts` - Server-side operations
- `/libs/supabase/client.ts` - Client-side operations
- `/libs/supabase/middleware.ts` - Session management

**Core Business Domains**:
- **Biathlon Results**: Integrates with external biathlon API to fetch race data and results
- **Categories**: Biathlon events/competitions (e.g., Östersund World Cup)
- **Matches**: Individual races within categories
- **Markets**: Prediction markets for each match (e.g., "Most penalties", "Winner")
- **Selections**: User predictions on markets
- **Competitors**: Biathlon athletes with IBU IDs
- **Leagues**: Private prediction leagues between users

**Market Types System**: Complex prediction system with different market types:
- Located in `/app/api/features/market-type/`
- Each market type has a formula for calculating results and points
- Some markets need analysis data, others need competitor data
- Points are calculated based on prediction accuracy

**External API Integration**: 
- Biathlon results API integration in `/app/api/features/biathlon-results/`
- Handles race data import, competitor import, and result calculation
- Uses caching and concurrency control with Bluebird

### Configuration

- **Main config**: `/config.ts` - Contains app settings, Stripe plans, email settings
- **Environment**: Uses standard Next.js env variables
- **Theme**: DaisyUI with custom "mytheme" theme

### Key Files to Understand

- `/types/types.ts` - Core TypeScript interfaces for all entities
- `/config.ts` - Application configuration
- `/middleware.ts` - Supabase session management
- `/app/layout.tsx` - Root layout with theme and analytics
- `/app/api/features/biathlon-results/service.ts` - Core business logic for race processing

### Development Notes

- Uses Supabase migrations in `/supabase/migrations/`
- Database operations use upsert patterns extensively
- Concurrent processing with Bluebird for external API calls
- Gender mapping from biathlon API to internal format
- Team vs individual competition handling