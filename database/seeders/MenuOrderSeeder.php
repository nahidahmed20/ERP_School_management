<?php

namespace Database\Seeders;

use App\Services\MenuOrderService;
use Illuminate\Database\Seeder;

class MenuOrderSeeder extends Seeder
{
    public function run(MenuOrderService $menuOrder): void
    {
        $menuOrder->apply();
    }
}
