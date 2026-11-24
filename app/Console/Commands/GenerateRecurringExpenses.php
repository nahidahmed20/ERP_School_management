<?php

namespace App\Console\Commands;

use App\Services\RecurringExpenseService;
use Illuminate\Console\Command;

class GenerateRecurringExpenses extends Command
{
    protected $signature = 'expenses:generate-recurring {--campus=}';
    protected $description = 'Create due recurring school expenses without marking them paid';

    public function handle(RecurringExpenseService $service): int
    {
        $campusId = $this->option('campus') ? (int) $this->option('campus') : null;
        $count = $service->generateDue($campusId);
        $this->info("Created {$count} due recurring expense(s).");

        return self::SUCCESS;
    }
}
