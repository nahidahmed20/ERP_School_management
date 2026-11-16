<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TranslationEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TranslationController extends Controller
{
    public function index(): Response
    {
        $this->authorizeManager();

        return Inertia::render('Admin/Translations/Index', [
            'overrides' => TranslationEntry::query()
                ->orderBy('source_key')
                ->get(['id', 'source_key', 'english_text', 'bangla_text']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeManager();

        $data = $request->validate([
            'source_key' => ['required', 'string', 'max:500', 'unique:translation_entries,source_key'],
            'english_text' => ['required', 'string', 'max:2000'],
            'bangla_text' => ['required', 'string', 'max:2000'],
        ]);

        TranslationEntry::create($data);

        return back()->with('success', 'Translation added successfully.');
    }

    public function update(Request $request, TranslationEntry $translation): RedirectResponse
    {
        $this->authorizeManager();

        $data = $request->validate([
            'source_key' => ['required', 'string', 'max:500', Rule::unique('translation_entries', 'source_key')->ignore($translation->id)],
            'english_text' => ['required', 'string', 'max:2000'],
            'bangla_text' => ['required', 'string', 'max:2000'],
        ]);

        $translation->update($data);

        return back()->with('success', 'Translation updated successfully.');
    }

    public function destroy(TranslationEntry $translation): RedirectResponse
    {
        $this->authorizeManager();

        $translation->delete();

        return back()->with('success', 'Translation override removed.');
    }

    private function authorizeManager(): void
    {
        abort_unless(request()->user()?->hasRole('Super Admin'), 403, 'Only Super Admin can manage project-wide translations.');
    }
}
