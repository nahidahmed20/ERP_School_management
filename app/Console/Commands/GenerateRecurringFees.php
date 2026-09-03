<?php

namespace App\Console\Commands;

use App\Services\FeeAutomationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateRecurringFees extends Command
{
    protected $signature = 'fees:generate {--date=} {--campus=}';
    protected $description = 'Generate due recurring invoices and apply overdue fines';

    public function handle(FeeAutomationService $service): int
    {
        $date = $this->option('date') ? Carbon::parse($this->option('date'))->startOfDay() : today();
        $result = $service->generate($date, $this->option('campus') ? (int) $this->option('campus') : null);
        $fines = $service->applyLateFines($date);
        $this->info("Invoices created: {$result['created']}; skipped: {$result['skipped']}; fines applied: {$fines}");
        return self::SUCCESS;
    }
}
