<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class StaffSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_missing_staff_lookups_and_seeds_staff_idempotently(): void
    {
        $this->seed(\Database\Seeders\StaffSeeder::class);

        $this->assertSame(1, DB::table('departments')->count());
        $this->assertSame('Academic', DB::table('departments')->value('name'));
        $this->assertSame(1, DB::table('designations')->count());
        $this->assertSame('Teacher', DB::table('designations')->value('name'));
        $this->assertSame(10, DB::table('staff')->count());

        $this->seed(\Database\Seeders\StaffSeeder::class);

        $this->assertSame(10, DB::table('staff')->count());
        $this->assertSame(1, DB::table('departments')->count());
        $this->assertSame(1, DB::table('designations')->count());
    }
}
