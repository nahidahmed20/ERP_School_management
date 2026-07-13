<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status') === 'active');
        }

        $query->orderBy('name');

        $perPage = $request->get('per_page', 10);
        $branches = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Campus/Index', [
            'branches' => $perPage === 'all'
                ? ['data' => $branches, 'links' => [], 'meta' => ['total' => $branches->count()]]
                : $branches,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);

        $school = Campus::firstOrCreate(
            ['id' => 1],
            ['name' => 'Main School']
        );
        $data['school_id'] = $school->id;

        DB::transaction(function () use ($data) {
            $branch = Branch::create($data);

            if ($branch->is_main) {
                Branch::where('id', '!=', $branch->id)->update(['is_main' => false]);
            }
        });

        return back()->with('success', 'নতুন Branch সফলভাবে যোগ করা হয়েছে।');
    }

    public function update(Request $request, Branch $branch)
    {
        $data = $this->validateData($request, $branch->id);

        DB::transaction(function () use ($data, $branch) {
            $branch->update($data);

            if ($branch->is_main) {
                Branch::where('id', '!=', $branch->id)->update(['is_main' => false]);
            }
        });

        return back()->with('success', 'Branch তথ্য সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroy(Branch $branch)
    {
        if ($branch->is_main) {
            return back()->with('error', 'Main Branch মুছে ফেলা যাবে না!');
        }

        $branch->delete();
        return back()->with('success', 'Branch মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:branches,code' . ($ignoreId ? ",{$ignoreId}" : ''),
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'is_main' => 'boolean',
            'status' => 'boolean',
        ]);
    }
}
