# ERP production deployment

Before launch, run `php artisan app:production-check` and resolve every failure.

Required processes:

- Web application behind HTTPS
- `php artisan queue:work --queue=default,communications,reports,backups --tries=4 --timeout=1800` managed by Supervisor/systemd
- `php artisan schedule:run` every minute through cron/task scheduler
- Daily encrypted backup is scheduled at 01:30; set `BACKUP_DRIVER=s3` and the dedicated `BACKUP_AWS_*` credentials for off-site storage
- Real SMTP, SMS, push and payment-gateway credentials
- `php artisan optimize` after every deployment
- `php artisan test` and `npm run build` in CI before deployment

Never expose `.env`, backup archives, private documents, queue dashboards or error details through the public web root.

After setting production secrets, cache configuration and verify it:

```bash
php artisan optimize
php artisan app:production-check
php artisan schedule:list
```

The deployment must stop if the production check fails. Configure `LOG_SLACK_WEBHOOK_URL` for critical error alerts and monitor failed jobs from Security Operations.
