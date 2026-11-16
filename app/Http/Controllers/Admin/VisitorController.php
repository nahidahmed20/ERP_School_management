<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VisitorController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $visitDate = $request->input('visit_date');

        $query = VisitorLog::latest('visit_date')->latest('in_time');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%")
                  ->orWhere('person_to_meet', 'like', "%{$search}%");
            });
        }

        if ($visitDate) {
            $query->where('visit_date', $visitDate);
        }

        $visitors = ($perPage === 'all')
            ? $query->paginate($query->count())->withQueryString()
            : $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/FrontOffice/VisitorBook/Index', [
            'visitors' => $visitors,
            'filters' => $request->only(['search', 'visit_date', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            VisitorLog::create($request->all());
            DB::commit();
            return back()->with('success', 'Visitor added successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $visitor = VisitorLog::findOrFail($id);
        $request->validate($this->validationRules());

        DB::beginTransaction();
        try {
            $visitor->update($request->all());
            DB::commit();
            return back()->with('success', 'Visitor details updated!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $visitor = VisitorLog::findOrFail($id);
        $visitor->delete();
        return back()->with('success', 'Visitor log deleted!');
    }

    private function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'purpose' => 'required|string|max:255',
            'person_to_meet' => 'nullable|string|max:255',
            'in_time' => 'required',
            'out_time' => 'nullable',
            'visit_date' => 'required|date',
        ];
    }
}
