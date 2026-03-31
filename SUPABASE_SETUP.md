# Supabase Setup

## 1. Create a Supabase project
- Open Supabase and create a new project.
- In Project Settings -> API, copy the project URL and anon public key.

## 2. Add local environment variables
Create a `.env.local` file in the project root.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Run the SQL file
- Open the Supabase SQL editor.
- Paste the contents of `supabase/schema.sql`.
- Run the script.

This creates:
- a `songs` table
- an `admin_users` table
- an `is_admin()` helper function
- public read access for songs
- admin-only insert, update, and delete access

## 4. Add your admin email once
Run this in the SQL editor after the schema script:

```sql
insert into public.admin_users (email)
values ('your-admin-email@example.com')
on conflict (email) do nothing;
```

Use the same email you put in `NEXT_PUBLIC_ADMIN_EMAIL`.

## 5. Create your admin user in Supabase
Go to Supabase Authentication and create the admin user with the same email.
Set a password you will remember.

This app now uses email + password for admin access, not magic links.
Public visitors do not need to sign in.

## 6. Run locally
```bash
npm run dev
```

## 7. Local behavior
- Everyone can browse songs.
- Only the admin account can add, edit, delete, and favorite songs.
- If the database is empty and the admin signs in, the current local song list will be moved into Supabase automatically.

## 8. Add env vars in Vercel
In Vercel -> Project Settings -> Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

For production, set `NEXT_PUBLIC_SITE_URL` to your deployed domain.

## 9. Deploy to Vercel
Once the env vars are added in Vercel, deploy normally.
The site will stay public, but only your admin account will unlock edit controls.
