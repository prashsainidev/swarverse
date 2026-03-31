# SwarVerse

A clean place to keep your saved guitar songs, favorite links, and practice picks in one spot.

## What It Does
- Browse your saved songs in a clean public view
- Search by title, artist, or tags
- Filter by type, difficulty, and artist
- Keep favorites easy to reach
- Sign in as admin to add, edit, delete, and favorite songs
- Sync songs with Supabase across devices

## Local Setup
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
npm run start
```

## Environment
Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
