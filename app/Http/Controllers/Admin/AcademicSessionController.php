<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicSession;
use App\Models\Campus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicSession::with('campus:id,name');

        if ($search = $request->get('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('campus_id')) {
            $query->where('campus_id', $request->get('campus_id'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderByDesc('start_date');

        $perPage = $request->get('per_page', 10);
        $sessions = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        return Inertia::render('Admin/Sessions/Index', [
            'sessions' => $perPage === 'all'
                ? ['data' => $sessions, 'links' => [], 'meta' => ['total' => $sessions->count()]]
                : $sessions,
            'campuses' => Campus::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['search', 'campus_id', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $this->applyCurrent($data);

        AcademicSession::create($data);

        return back()->with('success', 'নতুন Academic Session যোগ করা হয়েছে।');
    }

    public function update(Request $request, AcademicSession $session)
    {
        $data = $this->validateData($request);
        $this->applyCurrent($data, $session->id);

        $session->update($data);

        return back()->with('success', 'Academic Session আপডেট করা হয়েছে।');
    }

    public function destroy(AcademicSession $session)
    {
        $session->delete();

        return back()->with('success', 'Academic Session মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'boolean',
            'is_active' => 'boolean',
            'remarks' => 'nullable|string',
        ]);
    }

    private function applyCurrent(array &$data, $ignoreId = null): void
    {
        if (!empty($data['is_current'])) {
            AcademicSession::when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->update(['is_current' => false]);
        }
    }
}
