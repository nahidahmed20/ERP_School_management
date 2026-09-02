<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Campus; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Services\WebsiteSettingsService;
use Illuminate\Support\Facades\Storage;

class GeneralSettingController extends Controller
{
    public function index(Request $request, WebsiteSettingsService $websiteSettings)
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
            'websiteSettings' => $websiteSettings->values(),
        ]);
    }

    public function updateWebsite(Request $request, WebsiteSettingsService $websiteSettings)
    {
        $data = $request->validate([
            'school_name' => 'required|string|max:255',
            'school_short_name' => 'required|string|max:80',
            'school_tagline' => 'nullable|string|max:160',
            'primary_phone' => 'nullable|string|max:50',
            'secondary_phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'footer_description' => 'nullable|string|max:1000',
            'copyright_text' => 'nullable|string|max:255',
            'powered_by_text' => 'nullable|string|max:255',
            'facebook_url' => 'nullable|url|max:500',
            'youtube_url' => 'nullable|url|max:500',
            'linkedin_url' => 'nullable|url|max:500',
            'admission_session' => 'nullable|string|max:100',
            'admission_deadline' => 'nullable|string|max:100',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',
            'footer_logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:4096',
            'favicon' => 'nullable|image|mimes:png,jpg,jpeg,webp,ico|max:1024',
            'remove_logo' => 'nullable|boolean',
            'remove_footer_logo' => 'nullable|boolean',
            'remove_favicon' => 'nullable|boolean',
        ]);

        $labels = [
            'school_name' => 'School Name', 'school_short_name' => 'Short Name',
            'school_tagline' => 'Tagline', 'primary_phone' => 'Primary Phone',
            'secondary_phone' => 'Secondary Phone', 'email' => 'Email Address',
            'address' => 'Address', 'footer_description' => 'Footer Description',
            'copyright_text' => 'Copyright Text', 'powered_by_text' => 'Powered By Text',
            'facebook_url' => 'Facebook URL', 'youtube_url' => 'YouTube URL',
            'linkedin_url' => 'LinkedIn URL', 'admission_session' => 'Admission Session',
            'admission_deadline' => 'Admission Deadline',
        ];

        foreach ($labels as $key => $label) {
            Setting::withoutGlobalScopes()->updateOrCreate(
                ['key' => $key],
                ['campus_id' => null, 'group' => 'website', 'value' => $data[$key] ?? null,
                    'type' => in_array($key, ['address', 'footer_description']) ? 'textarea' : 'text',
                    'label' => $label, 'is_active' => true]
            );
        }

        foreach (['logo', 'footer_logo', 'favicon'] as $key) {
            $setting = Setting::withoutGlobalScopes()->where('key', $key)->first();
            if ($request->boolean('remove_'.$key) || $request->hasFile($key)) {
                if ($setting?->value) {
                    Storage::disk('public')->delete($setting->value);
                }
                $path = $request->hasFile($key) ? $request->file($key)->store('branding', 'public') : null;
                Setting::withoutGlobalScopes()->updateOrCreate(
                    ['key' => $key],
                    ['campus_id' => null, 'group' => 'website', 'value' => $path, 'type' => 'image',
                        'label' => ucwords(str_replace('_', ' ', $key)), 'is_active' => true]
                );
            }
        }

        $websiteSettings->clearCache();

        return back()->with('success', 'Website branding and footer settings updated successfully.');
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        Setting::create($data);
        app(WebsiteSettingsService::class)->clearCache();

        return back()->with('success', 'নতুন Setting সফলভাবে যোগ করা হয়েছে।');
    }

    public function update(Request $request, Setting $setting)
    {
        $data = $this->validateData($request, $setting->id);
        $setting->update($data);
        app(WebsiteSettingsService::class)->clearCache();

        return back()->with('success', 'Setting সফলভাবে আপডেট করা হয়েছে।');
    }

    public function destroy(Setting $setting)
    {
        $setting->delete();
        app(WebsiteSettingsService::class)->clearCache();
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
