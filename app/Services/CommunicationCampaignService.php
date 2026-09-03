<?php

namespace App\Services;

use App\Jobs\SendCommunicationDelivery;
use App\Models\CommunicationCampaign;
use App\Models\CommunicationDelivery;
use Illuminate\Support\Facades\DB;

class CommunicationCampaignService
{
    public function queue(CommunicationCampaign $campaign): array
    {
        abort_unless(in_array($campaign->status, ['approved', 'scheduled'], true), 422, 'Campaign must be approved.');
        $previousCampus = config('app.active_campus_id');
        config(['app.active_campus_id' => $campaign->campus_id]);

        try {
            return $this->queueForCampus($campaign);
        } finally {
            config(['app.active_campus_id' => $previousCampus]);
        }
    }

    private function queueForCampus(CommunicationCampaign $campaign): array
    {
        $rules = $campaign->audience_rules ?? $campaign->segment?->rules ?? [];
        $type = $campaign->segment?->audience_type ?? ($rules['audience_type'] ?? 'guardians');
        $people = app(AudienceResolver::class)->resolve($type, $rules);
        $rate = (float) config('services.sms.cost_per_segment', 0);
        $queued = $skipped = $segments = 0;

        DB::transaction(function () use ($campaign, $people, $rate, &$queued, &$skipped, &$segments) {
            foreach ($people as $person) {
                if (! $this->allowed($campaign->campus_id, $person['type'], $person['id'], $campaign->channel, $campaign->category)) {
                    $skipped++;
                    continue;
                }

                $destination = $this->destination($person, $campaign->channel);
                if (! $destination) {
                    $skipped++;
                    continue;
                }

                $metric = MessageMetrics::calculate($campaign->body, $campaign->channel === 'sms' ? $rate : 0);
                $delivery = CommunicationDelivery::firstOrCreate([
                    'communication_campaign_id' => $campaign->id,
                    'channel' => $campaign->channel,
                    'destination' => $destination,
                ], [
                    'campus_id' => $campaign->campus_id,
                    'recipient_type' => $person['type'],
                    'recipient_id' => $person['id'],
                    'recipient_name' => $person['name'],
                    'segments' => $metric['segments'],
                    'estimated_cost' => $metric['estimated_cost'],
                    'status' => 'queued',
                ]);

                if ($delivery->wasRecentlyCreated) {
                    SendCommunicationDelivery::dispatch($delivery->id)->afterCommit();
                    $queued++;
                    $segments += $metric['segments'];
                }
            }

            $campaign->update([
                'status' => 'processing',
                'recipient_count' => count($people),
                'skipped_count' => $skipped,
                'total_segments' => $segments,
                'estimated_cost' => round($segments * $rate, 4),
            ]);
        });

        return compact('queued', 'skipped');
    }

    private function allowed(int $campusId, string $type, int $id, string $channel, string $category): bool
    {
        $preference = DB::table('communication_preferences')
            ->where('campus_id', $campusId)
            ->where(['recipient_type' => $type, 'recipient_id' => $id, 'channel' => $channel])
            ->whereIn('category', ['*', $category])
            ->orderByRaw("category = '*' asc")
            ->first();

        if ($preference) return (bool) $preference->is_opted_in;

        if ($type === 'guardian') {
            $guardian = DB::table('guardians')->where('campus_id', $campusId)->find($id);
            $preferences = json_decode($guardian?->notification_preferences ?? '{}', true);
            if (array_key_exists($channel, $preferences) && ! (bool) $preferences[$channel]) return false;
            if (array_key_exists($category, $preferences) && ! (bool) $preferences[$category]) return false;
        }

        return true;
    }

    private function destination(array $person, string $channel): ?string
    {
        return match ($channel) {
            'sms', 'whatsapp' => $person['phone'],
            'email' => $person['email'],
            'push' => DB::table('push_subscriptions')->where('user_id', $person['user_id'])->latest('last_used_at')->value('endpoint'),
            default => null,
        };
    }
}
