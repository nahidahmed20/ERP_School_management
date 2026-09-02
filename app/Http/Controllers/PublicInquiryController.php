<?php

namespace App\Http\Controllers;

use App\Models\AdmissionInquiry;
use App\Models\HelpdeskTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicInquiryController extends Controller
{
    public function admission(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'child_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'campus' => ['required', 'string', 'max:100'],
            'grade' => ['required', 'string', 'max:100'],
            'guardian_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        AdmissionInquiry::create([
            'applicant_name' => $validated['child_name'],
            'guardian_name' => $validated['guardian_name'],
            'phone' => $validated['phone'],
            'class_interested' => $validated['grade'],
            'inquiry_date' => today(),
            'status' => 'Pending',
            'notes' => collect([
                'Date of birth: '.$validated['date_of_birth'],
                'Preferred campus: '.$validated['campus'],
                isset($validated['email']) ? 'Email: '.$validated['email'] : null,
            ])->filter()->implode("\n"),
        ]);

        return back()->with('success', 'Your admission inquiry has been submitted successfully.');
    }

    public function contact(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'campus' => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        HelpdeskTicket::create([
            'ticket_number' => 'WEB-'.Str::upper(Str::random(10)),
            'requester_name' => $validated['name'],
            'requester_type' => 'Website Visitor',
            'subject' => 'Website inquiry — '.$validated['campus'],
            'description' => collect([
                'Phone: '.$validated['phone'],
                isset($validated['email']) ? 'Email: '.$validated['email'] : null,
                '',
                $validated['message'],
            ])->filter(fn ($line) => $line !== null)->implode("\n"),
            'priority' => 'Medium',
            'status' => 'Open',
            'replies' => [],
        ]);

        return back()->with('success', 'Your message has been sent successfully.');
    }
}
