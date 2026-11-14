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

## Build production assets

After making frontend changes, run this from the project root:

```powershell
npm run build
```

This builds and verifies `public/build/`. It does not create an archive.

Before uploading changed files, back up the live database and files. Preserve
the server's existing `.env` and `storage/`, delete `public/hot` if present,
and ensure `storage/` and `bootstrap/cache/` are writable. Then run
`php artisan migrate --force` and `php artisan optimize:clear` from the project
root.

The project-root `.htaccess` forwards requests to `public/`; this setup assumes
the Laravel project root is the domain's Document Root. If the domain points
directly to `public/`, follow the hosting provider's Laravel document-root
layout instead.

## Deploy from Git (alternative)

Keep the Git checkout in the Laravel project root. Set cPanel Git Version
Control to track the production branch, or update that checkout from the server
terminal. The production `.env`, `vendor/`, `storage/`, local databases, and
`public/hot` stay on the server and are not committed.

On the development machine, run the production build after making frontend
changes. The build removes a stale local Vite hot-file, compiles the assets,
and verifies that the manifest points to files that exist:

```powershell
npm ci
npm run build
```

Then commit the source changes together with the generated build and push them
to the production branch:

```powershell
git add -A
git commit -m "Prepare production release"
git push origin main
```

`public/build/` is intentionally no longer ignored, so Git carries both
`manifest.json` and every hashed asset to cPanel. Do not commit `.env`, local
database files, `vendor/`, `node_modules/`, `storage/`, or `public/hot`.

On the server, update the same checkout and install production dependencies.
The deploy script also removes any old `public/hot` file so Laravel uses the
new production manifest:

```bash
bash deploy/deploy-cpanel.sh
```

Back up the database before migrations. Do not run `db:seed` on production;
the seeders create demo users and set their default passwords. If a deployment
fails, the script leaves the app in maintenance mode. Fix the reported issue,
then run `php artisan up` to restore service.

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

Ensure `storage/` and `bootstrap/cache/` are writable by the PHP process. Then
follow the server update commands in **Deploy from Git**.

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
