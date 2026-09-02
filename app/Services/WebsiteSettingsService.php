<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class WebsiteSettingsService
{
    public const CACHE_KEY = 'website.settings.global';

    public const DEFAULTS = [
        'school_name' => 'Verdant International School & Colleges',
        'school_short_name' => 'Verdant',
        'school_tagline' => 'INTERNATIONAL SCHOOL & COLLEGES',
        'logo' => null,
        'footer_logo' => null,
        'favicon' => null,
        'primary_phone' => '+880 1XXX-XXXXXX',
        'secondary_phone' => null,
        'email' => 'admissions@verdant.edu.bd',
        'address' => 'House 12, Road 5, Dhanmondi, Dhaka',
        'footer_description' => 'Four campuses across Bangladesh, one shared standard of care since 2004.',
        'copyright_text' => 'All rights reserved.',
        'powered_by_text' => 'Powered by Verdant ERP',
        'facebook_url' => null,
        'youtube_url' => null,
        'linkedin_url' => null,
        'admission_session' => null,
        'admission_deadline' => null,
    ];

    public function values(): array
    {
        if (! Schema::hasTable('settings')) {
            return self::DEFAULTS;
        }

        $values = Cache::rememberForever(self::CACHE_KEY, fn () => Setting::withoutGlobalScopes()
            ->whereNull('campus_id')
            ->where('group', 'website')
            ->where('is_active', true)
            ->pluck('value', 'key')
            ->all());

        $settings = array_merge(self::DEFAULTS, $values);

        foreach (['logo', 'footer_logo', 'favicon'] as $key) {
            $settings[$key] = $settings[$key] ? Storage::disk('public')->url($settings[$key]) : null;
        }

        return $settings;
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
