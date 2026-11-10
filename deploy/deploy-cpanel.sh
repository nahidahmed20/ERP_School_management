#!/usr/bin/env bash
set -Eeuo pipefail

ERP_PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ERP_PROJECT_ROOT"

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    printf 'Expected the production checkout on main; found %s.\n' "${CURRENT_BRANCH:-detached HEAD}" >&2
    exit 1
fi

if ! command -v php >/dev/null 2>&1 || ! command -v composer >/dev/null 2>&1 || ! command -v git >/dev/null 2>&1; then
    echo 'PHP, Composer, and Git must be available in the cPanel terminal.' >&2
    exit 1
fi

echo 'Entering maintenance mode...'
php artisan down
DEPLOY_IN_MAINTENANCE=1

on_deploy_exit() {
    EXIT_CODE=$?
    trap - EXIT
    if [[ "$EXIT_CODE" -ne 0 && "${DEPLOY_IN_MAINTENANCE:-0}" -eq 1 ]]; then
        echo 'Deployment stopped with an error. The site remains in maintenance mode; fix the issue, then run php artisan up.' >&2
    fi
    exit "$EXIT_CODE"
}
trap on_deploy_exit EXIT

git pull --ff-only origin main
# A leftover Vite hot file makes Laravel bypass the production manifest and
# request assets from a local development server. Always remove it on deploy.
rm -f public/hot
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan optimize:clear
php artisan app:production-check
php artisan optimize
php artisan up

DEPLOY_IN_MAINTENANCE=0
trap - EXIT
echo 'Deployment completed.'
