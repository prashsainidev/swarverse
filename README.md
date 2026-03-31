# SwarVerse

SwarVerse is a personal song vault for guitar practice. It lets you keep your saved song links in one place, browse them from any device, and manage everything through a simple admin-only workflow.

## Highlights
- Public read-only song library
- Admin-only add, edit, favorite, delete, and restore actions
- Supabase-backed sync across devices
- Search by title, artist, or tags
- Filter by type, difficulty, and artist
- Favorites shelf for quick access
- Trash shelf with restore support for deleted songs
- Dark and light mode

## Tech Stack
- Next.js 14
- React
- Supabase Auth + Database
- CSS Modules

## Local Development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build
```bash
npm run build
npm run start
```

## Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, set `NEXT_PUBLIC_SITE_URL` to your deployed domain.

## Supabase Setup
The SQL schema lives here:
- `supabase/schema.sql`

Run that file in the Supabase SQL Editor, then add your admin email to `admin_users`.

Detailed setup steps are in:
- `SUPABASE_SETUP.md`

## Project Structure
```txt
src/
  app/
  components/
  features/
    swarverse/
      components/
      hooks/
  hooks/
  lib/
public/
  brand/
supabase/
```

## Main Feature Areas
- `src/features/swarverse/hooks/useAdminSession.js`
  Handles admin auth/session state.
- `src/features/swarverse/hooks/useSongLibraryView.js`
  Handles shelves, filters, search, and pagination.
- `src/hooks/useSongs.js`
  Handles Supabase song CRUD, trash, restore, and local cache fallback.
- `src/features/swarverse/components/`
  Holds the main page sections and their CSS modules.

## Deploy Notes
- Add the same environment variables to Vercel.
- Set your Supabase `Site URL` to your production domain.
- Add both localhost and production URLs to Supabase redirect URLs.

## Current Admin Flow
- Public users can only browse songs.
- Admin users can sign in and manage the library.
- Deleted songs move to Trash first.
- Songs can be restored from Trash.
- `Delete forever` asks for confirmation before removing a song permanently.
