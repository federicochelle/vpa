# VPA

VPA is a real-estate website and content management application for browsing properties, projects, investment opportunities, and advisory content.

## Features

- Public pages for buying, renting, investing, advisory services, news, properties, and projects.
- Property and project listings with detail pages, filters, galleries, feature data, maps, and video links.
- Public inquiry forms with attribution data and Supabase persistence.
- Protected admin area for managing properties, projects, news, advisors, features, images, publication status, and display order.
- Supabase authentication for admin access.
- Public content in Spanish, English, and German, with locale selection.
- Cloudflare Images integration for image uploads and management.
- Optional Google Calendar integration for inquiry-related meetings and Google Maps/Places integration for locations and address autocomplete.
- Translation backfill scripts using OpenAI.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase (`@supabase/ssr` and `@supabase/supabase-js`)
- Cloudflare Images
- Google Maps/Places and Google Calendar APIs
- OpenAI API for translation backfill scripts
- ESLint and Node's built-in test runner

## Getting started

Requirements: Node.js with npm.

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local`, replace the placeholders with your local configuration, and start the development server:

```bash
cp .env.example .env.local
npm run dev
```

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run the Node test suite. |
| `npm run auth:invite` | Invite users through the Supabase admin script. |
| `npm run probe:cloudflare-images` | Check the Cloudflare Images configuration. |
| `npm run translations:backfill:dry` | Preview public-content translation backfills. |
| `npm run translations:backfill` | Write public-content translation backfills. |
| `npm run translations:features:dry` | Preview feature translation backfills. |
| `npm run translations:features` | Write feature translation backfills. |

## Environment variables

Use placeholders in `.env.local`; do not commit credentials.

```dotenv
NEXT_PUBLIC_SITE_URL=<site-url>
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>

CLOUDFLARE_ACCOUNT_ID=<cloudflare-account-id>
CLOUDFLARE_IMAGES_API_TOKEN=<cloudflare-images-api-token>
CLOUDFLARE_IMAGES_ACCOUNT_HASH=<cloudflare-images-account-hash>

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-api-key>
GOOGLE_CALENDAR_CLIENT_ID=<google-calendar-client-id>
GOOGLE_CALENDAR_CLIENT_SECRET=<google-calendar-client-secret>
GOOGLE_CALENDAR_REFRESH_TOKEN=<google-calendar-refresh-token>
GOOGLE_CALENDAR_ID=<google-calendar-id>
GOOGLE_CALENDAR_TIME_ZONE=<iana-time-zone>

OPENAI_API_KEY=<openai-api-key>
```

Supabase variables are used by the application's public data and admin flows. Cloudflare Images, Google Maps/Places, Google Calendar, and OpenAI variables are used by their respective integrations and scripts.

## Project structure

```text
src/app/           Next.js routes, layouts, pages, and API handlers
src/assets/        Images imported by React components
src/components/    Shared UI and layout components
src/features/      Domain-specific data access, actions, and feature components
src/i18n/          Public locale configuration and translations
src/lib/           Integrations, utilities, SEO, media, and Supabase clients
src/types/         Shared TypeScript domain types
public/            Static files served directly by URL
scripts/           Operational and data-maintenance scripts
supabase/          Database migrations and seed data
tests/             Node test files
```
