<?php

namespace App\Services;

use App\Models\SaasTenant;
use App\Models\Student;

class TenantStudentCapacity
{
    public function allows(SaasTenant $tenant, int $incomingCount = 1): bool
    {
        $plan = $tenant->plan;
        if (! $plan) {
            return true;
        }

        $campuses = $tenant->campuses()->pluck('id');
        $currentCount = Student::withoutGlobalScopes()->whereIn('campus_id', $campuses)->count();

        return $currentCount + $incomingCount <= $plan->max_students;
    }
}
