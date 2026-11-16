<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:en,bn'],
        ]);

        $request->session()->put('locale', $validated['locale']);
        app()->setLocale($validated['locale']);

        return back();
    }
}
