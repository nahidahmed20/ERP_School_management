<?php

namespace Tests\Feature;

use App\Models\Campus;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GovernmentHolidaySyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_holiday_feed_is_imported_for_every_active_campus_without_duplicates(): void
    {
        Campus::create(['name' => 'Main', 'code' => 'MAIN', 'is_active' => true]);
        Campus::create(['name' => 'Branch', 'code' => 'BRANCH', 'is_active' => true]);
        $file = tempnam(sys_get_temp_dir(), 'holidays-');
        file_put_contents($file, json_encode(['holidays' => [[
            'date' => '2027-03-26',
            'title' => 'Independence Day',
            'source_reference' => 'https://mopa.gov.bd/',
        ]]], JSON_THROW_ON_ERROR));

        try {
            $this->artisan('holidays:sync', ['year' => 2027, '--file' => $file])->assertSuccessful();
            $this->artisan('holidays:sync', ['year' => 2027, '--file' => $file])->assertSuccessful();
        } finally {
            @unlink($file);
        }

        $this->assertSame(2, Event::withoutGlobalScopes()->where('is_government_holiday', true)->count());
        $this->assertSame(2, Event::withoutGlobalScopes()->where('show_on_dashboard', true)->count());
    }
}
