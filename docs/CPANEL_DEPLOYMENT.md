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

## Deploy from Git

Keep the Git checkout in the Laravel project root. Set cPanel Git Version
Control to track the production branch, or update that checkout from the server
terminal. The production `.env`, `vendor/`, `storage/`, local databases, and
`public/hot` stay on the server and are not committed.

On the development machine, build the frontend and commit its manifest/assets
with the matching source changes:

```powershell
npm ci
npm run build
git add .gitignore resources/js resources/css public/build deploy/deploy-cpanel.sh docs/CPANEL_DEPLOYMENT.md
git commit -m "Prepare production release"
git push origin main
```

`public/build/` is intentionally no longer ignored, so Git carries both
`manifest.json` and every hashed asset to cPanel. Do not commit `.env`, local
database files, `vendor/`, `node_modules/`, `storage/`, or `public/hot`.

On the server, update the same checkout and install production dependencies:

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
