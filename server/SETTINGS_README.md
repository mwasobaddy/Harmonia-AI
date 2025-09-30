Settings persistence (key/value) and migration

What changed
- Added a `Setting` model to `prisma/schema.prisma` to store admin-editable settings as key/value pairs.
- Added `src/services/settingsService.js` with helpers to get and upsert settings. Secrets can be encrypted when `SETTINGS_ENCRYPTION_KEY` or `JWT_SECRET` is set.

How to apply the schema changes locally
1. From the `server/` directory, generate the Prisma client and create a migration:

```bash
cd server
npx prisma generate
npx prisma migrate dev --name add_settings_table
```

2. Restart your server (or the dev process). The admin settings endpoints are now available at:
- GET  /api/admin/settings  (returns masked secrets)
- PUT  /api/admin/settings  (accepts whitelisted keys and persists them)

Security notes
- For production, prefer a secrets manager for critical API keys. If you allow editing API keys via the UI, ensure `SETTINGS_ENCRYPTION_KEY` is set and rotated securely.
