# SwarVerse

SwarVerse is a personal song vault for guitar practice. It keeps your saved song and chord links in one place, lets you browse them from any device, and is completely self-contained (zero external database dependencies).

## Highlights

- **112 Curated Songs** with chords and tabs across Bollywood, Indie, and Western hits.
- **Multiple Chord Arrangements**: Direct launch links for Ultimate Guitar, Wrytin, Indichords, and Chordify on single songs.
- **Glassmorphic Modern UI**: Obsidian theme with neon ambient mesh lighting and micro-interactions.
- **Zero Database Limits**: 100% self-contained code-based song library (no Supabase needed).
- **Fast Search & Filters**: Search by song name, artist, or tags (`#romantic`, `#indie`, `#bollywood`), filter by difficulty or type.
- **Favorites Shelf**: Instant client-side favorite bookmarking persisted in `localStorage`.
- **Dark & Light Mode**: Smooth theme toggling with preferred system theme detection.

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


## Adding New Songs

Songs are managed cleanly in code:

- Add or modify songs in `src/lib/songs/defaultSongs.js`
- Backup reference available in `swarverse-backup.json`
