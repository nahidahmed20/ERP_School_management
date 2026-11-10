# cPanel deployment

## Choose the document root

The recommended setup is to set the domain's Document Root to the Laravel
`public/` directory. Upload the application outside the web root where your
hosting plan allows it, then point the domain at that application's `public/`
folder. In this layout, the root `.htaccess` is not used; `public/.htaccess`
handles Laravel routes.

If cPanel requires the Laravel project itself to live in the Document Root,
keep the project-root `.htaccess`. It blocks direct requests to internal
directories and forwards public requests to `public/`. In this layout, the
Vite build must be at `public/build/` inside the project.

Do not use `server.php` for production. It is only for PHP's built-in local
development server.

## Build and upload

From the project root on Windows, build a release archive:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\build-cpanel-release.ps1
```

Upload the generated `deploy/releases/erp-school-cpanel-*.zip` and extract it
into the Laravel project root. The script builds the frontend, confirms every
manifest asset exists, and packages source plus `public/build/manifest.json`
and all hashed assets together. The archive excludes `.env`, `vendor`,
`node_modules`, `storage`, local databases, and tests. The `.gitignore` excludes
`public/build`, so do not rely on Git alone to send compiled assets.

Use these destinations:

| cPanel Document Root | Build destination |
| --- | --- |
| Laravel project root | `<project>/public/build/` |
| Laravel `public/` directory | `<document-root>/build/` |

Do not upload the development machine's `.env`, `public/hot`, `vendor`, or
`storage` contents over production data. Keep the production `.env`, `APP_KEY`,
database, uploads, and private files on the server.

## Configure the server

Use cPanel MultiPHP Manager to select PHP 8.2 or newer. Keep the single
cPanel-generated PHP handler in `.htaccess`; do not add a second handler for
a different PHP version. The application requires PHP `^8.2`.

Set the production `.env` on the server with at least:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
```

Keep the existing production `APP_KEY`; configure the production database,
session, cache, mail, and payment credentials there as well. Do not copy the
local `.env` file from this repository.

Ensure `storage/` and `bootstrap/cache/` are writable by the PHP process. From
the project root on the server, run:

```bash
php artisan down
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan app:production-check
php artisan optimize
php artisan up
```

Back up the database before migrations. Do not run `db:seed` on production;
the seeders create demo users and set their default passwords. If a deployment
fails before `artisan up`, restore service with `php artisan up` after fixing
the reported issue.

## Verify the deployed build

Open the live page source and find the `app-*.css` asset. Compare its name to
`public/build/manifest.json` on the server. If the names differ, Laravel is
reading a different or older manifest, or the page is served from another
Document Root. If they match but the CSS request is 404, the matching hashed
file is missing from that Document Root's `build/assets/` directory. Then
hard-refresh the browser or clear the hosting/CDN cache.

The root `.htaccess` rewrite works only when the Laravel project root is the
Document Root. If the domain points directly at `public/`, deploy and verify
`public/.htaccess` instead.
