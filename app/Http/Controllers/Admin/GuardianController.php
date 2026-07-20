<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuardianController extends Controller
{
    public function index(Request $request)
    {
        $query = Guardian::with(['students.currentEnrollment.schoolClass', 'students.currentEnrollment.section']);

        if ($request->search) {
            $query->where('father_name', 'like', "%{$request->search}%")
                  ->orWhere('father_phone', 'like', "%{$request->search}%")
                  ->orWhere('mother_name', 'like', "%{$request->search}%")
                  ->orWhere('mother_phone', 'like', "%{$request->search}%");
        }

        $parents = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Admin/Students/Parents', [
            'parents' => $parents,
            'filters' => $request->only(['search', 'per_page'])
        ]);
    }
}
