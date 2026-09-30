<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{AudienceSegment, CommunicationCampaign, Guardian, SmsTemplate, Staff, Student};
use App\Services\{CommunicationCampaignService, MessageMetrics};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Http};
use Inertia\Inertia;

class CommunicationCenterController extends Controller
{
    private function raw(string $table)
    {
        return DB::table($table)->where($table.'.campus_id', config('app.active_campus_id'));
    }

    public function index()
    {
        $activeCampusId = config('app.active_campus_id');

        return Inertia::render('Admin/Communication/Center', [
            // 🟢 FIX: All queries are now strictly scoped to the active campus
            'templates' => SmsTemplate::where('campus_id', $activeCampusId)->latest()->get(),
            'segments' => AudienceSegment::where('campus_id', $activeCampusId)->latest()->get(),
            'campaigns' => CommunicationCampaign::with('deliveries')
                                ->where('campus_id', $activeCampusId)
                                ->latest()
                                ->take(100)
                                ->get(),
            'providers' => DB::table('communication_provider_statuses')->get()
        ]);
    }

    public function template(Request $r)
    {
        $d = $r->validate([
            'id' => 'nullable|integer',
            'key' => 'required|string|max:100',
            'name' => 'required|string|max:255',
            'channel' => 'required|in:sms,email,whatsapp,push',
            'category' => 'required|string|max:80',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
            'estimated_cost_per_segment' => 'numeric|min:0',
            'is_active' => 'boolean',
            'auto_send' => 'boolean'
        ]);

        $id = $d['id'] ?? null;
        unset($d['id']);

        if ($id) {
            SmsTemplate::where('campus_id', config('app.active_campus_id'))->findOrFail($id)->update($d);
        } else {
            SmsTemplate::create($d + ['campus_id' => config('app.active_campus_id')]);
        }

        return back()->with('success', 'Template saved successfully.');
    }

    public function segment(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'audience_type' => 'required|in:students,guardians,staff',
            'rules' => 'nullable|array'
        ]);

        AudienceSegment::create($d + ['campus_id' => config('app.active_campus_id')]);
        
        return back()->with('success', 'Audience segment created.');
    }

    public function campaign(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'channel' => 'required|in:sms,email,whatsapp,push',
            'category' => 'required|string|max:80',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
            'audience_segment_id' => 'required|integer',
            'audience_rules' => 'nullable|array',
            'scheduled_at' => 'nullable|date'
        ]);

        if (!empty($d['audience_segment_id'])) {
            AudienceSegment::where('campus_id', config('app.active_campus_id'))->findOrFail($d['audience_segment_id']);
        }

        CommunicationCampaign::create($d + [
            'campus_id' => config('app.active_campus_id'),
            'status' => 'draft',
            'created_by' => $r->user()->id
        ]);

        return back()->with('success', 'Campaign saved as draft.');
    }

    public function approve(Request $r, $id)
    {
        $campaign = CommunicationCampaign::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        abort_unless($campaign->status === 'draft', 422, 'Only drafts can be approved.');
        
        $campaign->update([
            'status' => $campaign->scheduled_at ? 'scheduled' : 'approved',
            'approved_by' => $r->user()->id,
            'approved_at' => now()
        ]);
        
        return back()->with('success', 'Campaign approved successfully.');
    }

    public function dispatch($id, CommunicationCampaignService $s)
    {
        $campaign = CommunicationCampaign::where('campus_id', config('app.active_campus_id'))->findOrFail($id);
        $result = $s->queue($campaign);
        
        return back()->with('success', "{$result['queued']} deliveries queued; {$result['skipped']} skipped.");
    }

    public function metrics(Request $r)
    {
        $d = $r->validate(['message' => 'nullable|string', 'rate' => 'nullable|numeric|min:0']);
        return response()->json(MessageMetrics::calculate($d['message'] ?? '', (float)($d['rate'] ?? config('services.sms.cost_per_segment', 0))));
    }

    public function balance()
    {
        foreach (['sms', 'whatsapp', 'push'] as $channel) {
            $cfg = config("services.$channel");
            try {
                $url = $cfg['balance_url'] ?? null;
                if (!$url) throw new \RuntimeException('Balance endpoint not configured');
                
                $res = Http::timeout(15)->withToken($cfg['api_key'] ?? '')->get($url)->throw();
                
                DB::table('communication_provider_statuses')->updateOrInsert(
                    ['channel' => $channel],
                    [
                        'balance' => $res->json('balance'),
                        'currency' => $res->json('currency', 'BDT'),
                        'status' => 'online',
                        'last_response' => $res->body(),
                        'checked_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
            } catch (\Throwable $e) {
                DB::table('communication_provider_statuses')->updateOrInsert(
                    ['channel' => $channel],
                    [
                        'status' => 'unavailable',
                        'last_response' => $e->getMessage(),
                        'checked_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
            }
        }
        return back()->with('success', 'Provider balances checked.');
    }

    public function preference(Request $r)
    {
        $d = $r->validate([
            'recipient_type' => 'required|in:student,guardian,staff',
            'recipient_id' => 'required|integer',
            'channel' => 'required|in:sms,email,whatsapp,push',
            'category' => 'required|string|max:80',
            'is_opted_in' => 'required|boolean'
        ]);

        $exists = match($d['recipient_type']) {
            'student' => Student::where('campus_id', config('app.active_campus_id'))->whereKey($d['recipient_id'])->exists(),
            'guardian' => Guardian::where('campus_id', config('app.active_campus_id'))->whereKey($d['recipient_id'])->exists(),
            'staff' => Staff::where('campus_id', config('app.active_campus_id'))->whereKey($d['recipient_id'])->exists()
        };

        abort_unless($exists, 422, 'Recipient does not belong to the active campus.');

        $keys = collect($d)->only(['recipient_type', 'recipient_id', 'channel', 'category'])->all() + ['campus_id' => config('app.active_campus_id')];
        
        $this->raw('communication_preferences')->updateOrInsert(
            $keys,
            $d + ['campus_id' => config('app.active_campus_id'), 'changed_at' => now(), 'created_at' => now(), 'updated_at' => now()]
        );
        
        return back()->with('success', 'Communication consent updated.');
    }
}