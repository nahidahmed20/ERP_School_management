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
        'school_name' => 'Your School Name',
        'school_short_name' => 'School',
        'school_tagline' => 'SCHOOL MANAGEMENT SYSTEM',
        'logo' => null,
        'footer_logo' => null,
        'favicon' => null,
        'primary_phone' => '+880 1XXX-XXXXXX',
        'secondary_phone' => null,
        'email' => null,
        'address' => null,
        'footer_description' => null,
        'copyright_text' => 'All rights reserved.',
        'powered_by_text' => 'Powered by School ERP',
        'facebook_url' => null,
        'youtube_url' => null,
        'linkedin_url' => null,
        'admission_session' => null,
        'admission_deadline' => null,
        'hero_eyebrow' => 'Admissions are now open',
        'hero_title' => 'A school where every learner can thrive.',
        'hero_description' => 'A caring, future-ready learning community connecting students, teachers and families.',
        'principal_name' => 'Head of School',
        'principal_message' => 'We nurture curiosity, character and confidence so every learner is ready for tomorrow.',
        'primary_color' => '#12372A',
        'accent_color' => '#E9B949',
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
