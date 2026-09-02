<?php

namespace App\Console\Commands;

use App\Models\Campus;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SyncGovernmentHolidays extends Command
{
    protected $signature = 'holidays:sync {year?} {--file=} {--url=}';

    protected $description = 'Synchronize verified Bangladesh government holidays into every active campus calendar';

    public function handle(): int
    {
        $year = (int) ($this->argument('year') ?: now()->year);
        $sourceUrl = $this->option('url') ?: config('services.government_holidays.feed_url');
        $sourceFile = $this->option('file');

        try {
            $payload = $sourceFile
                ? json_decode(file_get_contents($sourceFile), true, flags: JSON_THROW_ON_ERROR)
                : $this->download($sourceUrl, $year);
        } catch (\Throwable $exception) {
            $this->error('Holiday sync failed: '.$exception->getMessage());

            return self::FAILURE;
        }

        $holidays = collect($payload['holidays'] ?? $payload)
            ->filter(fn ($holiday) => is_array($holiday) && ! empty($holiday['date']) && ! empty($holiday['title']))
            ->filter(fn ($holiday) => Carbon::parse($holiday['date'])->year === $year);

        if ($holidays->isEmpty()) {
            $this->warn("No valid holidays found for {$year}; existing calendar data was not changed.");

            return self::FAILURE;
        }

        $campusIds = Campus::where('is_active', true)->pluck('id');
        if ($campusIds->isEmpty()) {
            $campusIds = collect([null]);
        }

        $synced = 0;
        foreach ($campusIds as $campusId) {
            foreach ($holidays as $holiday) {
                $date = Carbon::parse($holiday['date']);
                $endDate = Carbon::parse($holiday['end_date'] ?? $holiday['date']);
                $sourceKey = hash('sha256', $year.'|'.$date->toDateString().'|'.$holiday['title']);

                Event::withoutGlobalScopes()->updateOrCreate(
                    ['campus_id' => $campusId, 'source_key' => $sourceKey],
                    [
                        'title' => $holiday['title'],
                        'type' => 'Holiday',
                        'is_government_holiday' => true,
                        'start_datetime' => $date->startOfDay(),
                        'end_datetime' => $endDate->endOfDay(),
                        'description' => $holiday['description'] ?? 'Bangladesh government holiday',
                        'is_active' => true,
                        'show_on_dashboard' => true,
                        'audience' => 'all',
                        'source_name' => $holiday['source_name'] ?? 'Government of Bangladesh',
                        'source_reference' => $holiday['source_reference'] ?? $sourceUrl,
                    ]
                );
                $synced++;
            }
        }

        $this->info("Government holidays synchronized: {$synced} calendar records for {$year}.");

        return self::SUCCESS;
    }

    private function download(?string $sourceUrl, int $year): array
    {
        if (! $sourceUrl) {
            throw new RuntimeException('Set GOVERNMENT_HOLIDAY_FEED_URL or pass --file/--url with a verified JSON feed.');
        }

        $url = str_replace('{year}', (string) $year, $sourceUrl);

        return Http::retry(3, 500)->timeout(20)->acceptJson()->get($url)->throw()->json();
    }
}
