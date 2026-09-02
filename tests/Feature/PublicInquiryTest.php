<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicInquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_can_submit_an_admission_inquiry(): void
    {
        $response = $this->post(route('site.admissions.store'), [
            'child_name' => 'Ayesha Rahman',
            'date_of_birth' => now()->subYears(6)->toDateString(),
            'campus' => 'Dhanmondi',
            'grade' => 'Class 1',
            'guardian_name' => 'Nasrin Akter',
            'phone' => '01700000000',
            'email' => 'parent@example.com',
        ]);

        $response->assertRedirect()->assertSessionHas('success');
        $this->assertDatabaseHas('admission_inquiries', [
            'applicant_name' => 'Ayesha Rahman',
            'guardian_name' => 'Nasrin Akter',
            'status' => 'Pending',
        ]);
    }

    public function test_admission_inquiry_is_validated(): void
    {
        $this->from(route('site.admissions'))
            ->post(route('site.admissions.store'), [])
            ->assertRedirect(route('site.admissions'))
            ->assertSessionHasErrors([
                'child_name',
                'date_of_birth',
                'campus',
                'grade',
                'guardian_name',
                'phone',
            ]);
    }

    public function test_visitor_can_submit_a_contact_inquiry(): void
    {
        $response = $this->post(route('site.contact.store'), [
            'name' => 'Visitor Name',
            'phone' => '01800000000',
            'email' => 'visitor@example.com',
            'campus' => 'Uttara',
            'message' => 'Please contact me about the school.',
        ]);

        $response->assertRedirect()->assertSessionHas('success');
        $this->assertDatabaseHas('helpdesk_tickets', [
            'requester_name' => 'Visitor Name',
            'requester_type' => 'Website Visitor',
            'status' => 'Open',
        ]);
    }
}
