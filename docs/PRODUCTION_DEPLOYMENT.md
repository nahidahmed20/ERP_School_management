# ERP production deployment

Before launch, run `php artisan app:production-check` and resolve every failure.

Required processes:

- Web application behind HTTPS
- `php artisan queue:work --tries=4 --timeout=120` managed by Supervisor/systemd
- `php artisan schedule:run` every minute through cron/task scheduler
- Daily encrypted backup copied to off-site storage
- Real SMTP, SMS, push and payment-gateway credentials
- `php artisan optimize` after every deployment
- `php artisan test` and `npm run build` in CI before deployment

Never expose `.env`, backup archives, private documents, queue dashboards or error details through the public web root.
