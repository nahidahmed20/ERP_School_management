<?php

namespace App\Http\Controllers;

use App\Models\Campus;
use App\Models\CommunicationCms;
use App\Models\Event;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    private function campusesData()
    {
        return Schema::hasTable('campuses')
            ? Campus::where('is_active', true)->orderByDesc('is_main')->orderBy('order')->get()
            : collect();
    }

    private function teacherQuery()
    {
        return Staff::withoutGlobalScopes()->with(['campus:id,name', 'department:id,name', 'designation:id,name'])
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereHas('teachingAssignments', fn ($assignment) => $assignment->where('is_active', true))
                    ->orWhereHas('designation', fn ($designation) => $designation->where('name', 'like', '%teacher%')->orWhere('name', 'like', '%principal%'));
            });
    }

    private function articleQuery()
    {
        return CommunicationCms::withoutGlobalScopes()->with('campus:id,name')->where('is_published', true)
            ->whereIn('content_type', ['Blog', 'News', 'Article', 'blog', 'news', 'article']);
    }

    public function home(): Response
    {
        return Inertia::render('Site/Home', [
            'campuses' => $this->campusesData(),
            'teachers' => Schema::hasTable('staff') ? $this->teacherQuery()->latest('joining_date')->take(4)->get() : collect(),
            'articles' => Schema::hasTable('communication_cms') ? $this->articleQuery()->latest()->take(3)->get() : collect(),
            'notices' => Schema::hasTable('events') ? Event::withoutGlobalScopes()->where('is_active', true)->where('show_on_dashboard', true)->where('end_datetime', '>=', now()->subDays(30))->latest('start_datetime')->take(5)->get(['id', 'title', 'type', 'start_datetime', 'description']) : collect(),
            'stats' => [
                'students' => Schema::hasTable('students') ? Student::withoutGlobalScopes()->where('status', true)->count() : 0,
                'teachers' => Schema::hasTable('staff') ? Staff::withoutGlobalScopes()->where('is_active', true)->count() : 0,
                'campuses' => Schema::hasTable('campuses') ? Campus::where('is_active', true)->count() : 0,
                'classes' => Schema::hasTable('school_classes') ? SchoolClass::withoutGlobalScopes()->where('is_active', true)->count() : 0,
            ],
        ]);
    }

    public function campuses(): Response { return Inertia::render('Site/Campuses', ['campusRecords' => $this->campusesData()]); }
    public function academics(): Response { return Inertia::render('Site/Academics', ['classes' => Schema::hasTable('school_classes') ? SchoolClass::withoutGlobalScopes()->where('is_active', true)->orderBy('numeric_name')->get(['id', 'name', 'description']) : collect()]); }
    public function admissions(): Response { return Inertia::render('Site/Admissions', ['campusRecords' => $this->campusesData(), 'classes' => Schema::hasTable('school_classes') ? SchoolClass::withoutGlobalScopes()->where('is_active', true)->orderBy('numeric_name')->get(['id', 'name']) : collect()]); }
    public function contact(): Response { return Inertia::render('Site/Contact', ['campusRecords' => $this->campusesData()]); }
    public function teachers(): Response { return Inertia::render('Site/Teachers', ['teachers' => Schema::hasTable('staff') ? $this->teacherQuery()->orderBy('first_name')->get() : collect()]); }
    public function blogs(): Response { return Inertia::render('Site/Blogs', ['articles' => Schema::hasTable('communication_cms') ? $this->articleQuery()->latest()->paginate(9) : []]); }
    public function blog(string $slug): Response
    {
        abort_unless(Schema::hasTable('communication_cms'), 404);
        $article = $this->articleQuery()->where('slug', $slug)->firstOrFail();
        return Inertia::render('Site/BlogShow', ['article' => $article]);
    }
}
