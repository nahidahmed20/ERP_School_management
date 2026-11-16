<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ProductionReadinessCheck extends Command
{
    protected $signature = 'app:production-check';
    protected $description = 'Fail when critical ERP production settings are unsafe or incomplete';

    public function handle(): int
    {
        $checks = [
            ['Production environment', app()->environment('production'), app()->environment()],
            ['Debug disabled', !config('app.debug'), config('app.debug') ? 'enabled' : 'disabled'],
            ['HTTPS application URL', str_starts_with((string) config('app.url'), 'https://'), (string) config('app.url')],
            ['Dhaka timezone', config('app.timezone') === 'Asia/Dhaka', (string) config('app.timezone')],
            ['Real mail transport', !in_array(config('mail.default'), ['log', 'array'], true), (string) config('mail.default')],
            ['Persistent queue', !in_array(config('queue.default'), ['sync', 'null'], true), (string) config('queue.default')],
            ['Real SMS provider', config('services.sms.driver') !== 'log' && filled(config('services.sms.url')), (string) config('services.sms.driver')],
            ['Live payment gateway', !config('services.sslcommerz.sandbox') && filled(config('services.sslcommerz.store_id')), config('services.sslcommerz.sandbox') ? 'sandbox' : 'live'],
            ['Backup disk writable', $this->writableBackupDisk(), (string) config('erp.backup_disk', 'backup')],
            ['Off-site backup', config('filesystems.disks.backup.driver') !== 'local', (string) config('filesystems.disks.backup.driver')],
            ['Error alerting', filled(config('logging.channels.slack.url')), filled(config('logging.channels.slack.url')) ? 'configured' : 'missing'],
        ];
        $this->table(['Check', 'Result', 'Current'], array_map(fn ($check) => [$check[0], $check[1] ? 'PASS' : 'FAIL', $check[2]], $checks));
        if (collect($checks)->contains(fn ($check) => !$check[1])) {
            $this->error('Production readiness check failed. Resolve every failed item before launch.');
            return self::FAILURE;
        }
        $this->info('All critical production readiness checks passed.');
        return self::SUCCESS;
    }

    private function writableBackupDisk(): bool
    {
        try { $disk=config('erp.backup_disk','backup');Storage::disk($disk)->put('.readiness', now()->toIso8601String()); Storage::disk($disk)->delete('.readiness'); return true; }
        catch (\Throwable) { return false; }
    }
}
