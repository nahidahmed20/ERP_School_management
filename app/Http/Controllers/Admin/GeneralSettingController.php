<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Campus; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class GeneralSettingController extends Controller
{
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%")
                  ->orWhere('key', 'like', "%{$search}%");
            });
        }

        if ($request->filled('group')) {
            $query->where('group', $request->get('group'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $query->orderBy('group')->orderBy('order');

        $perPage = $request->get('per_page', 10);
        $settings = $perPage === 'all'
            ? $query->get()
            : $query->paginate((int) $perPage)->withQueryString();

        $campuses = Campus::select('id', 'name')->get();

        return Inertia::render('Admin/General/Index', [
            'settings' => $perPage === 'all'
                ? ['data' => $settings, 'links' => [], 'meta' => ['total' => $settings->count()]]
                : $settings,
            'groups' => Setting::select('group')->distinct()->orderBy('group')->pluck('group'),
            'campuses' => $campuses, 
            'filters' => $request->only(['search', 'group', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Setting::create($data);

        return back()->with('success', 'নতুন Setting সফলভাবে যোগ করা হয়েছে।');
    }

    public function update(Request $request, Setting $setting)
    {
        $data = $this->validateData($request, $setting->id);
        $setting->update($data);

        return back()->with('success', 'Setting সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroy(Setting $setting)
    {
        $setting->delete();
        return back()->with('success', 'Setting সফলভাবে মুছে ফেলা হয়েছে।');
    }

    private function validateData(Request $request, $ignoreId = null): array
    {
        $campusId = $request->campus_id ?? config('app.active_campus_id');

        return $request->validate([
            'campus_id' => 'required|exists:campuses,id', 
            'group' => 'required|string|max:100',
            'key' => [
                'required',
                'string',
                'max:150',
                Rule::unique('settings', 'key')
                    ->where('campus_id', $campusId) 
                    ->ignore($ignoreId)
            ],
            'value' => 'nullable|string',
            'type' => 'required|in:text,textarea,number,boolean,image,select,json',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);
    }
}