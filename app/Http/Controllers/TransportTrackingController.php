<?php

namespace App\Http\Controllers;

use App\Models\TransportStop;
use App\Models\Vehicle;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransportTrackingController extends Controller
{
    public function ingest(Request $request, Vehicle $vehicle)
    {
        abort_unless(
            $vehicle->tracking_token_hash
                && hash_equals($vehicle->tracking_token_hash, hash('sha256', (string) $request->bearerToken())),
            401,
        );

        $data = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'speed' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|between:0,360',
            'recorded_at' => 'nullable|date',
        ]);

        VehicleLocation::create($data + [
            'campus_id' => $vehicle->campus_id,
            'vehicle_id' => $vehicle->id,
            'recorded_at' => $data['recorded_at'] ?? now(),
        ]);

        if ($vehicle->transport_route_id) {
            foreach (TransportStop::where('transport_route_id', $vehicle->transport_route_id)
                ->whereNotNull('latitude')
                ->get() as $stop) {
                $distance = $this->distance($data['latitude'], $data['longitude'], $stop->latitude, $stop->longitude);

                if ($distance <= $stop->geofence_radius_m
                    && ! DB::table('transport_geofence_events')
                        ->where('vehicle_id', $vehicle->id)
                        ->where('transport_stop_id', $stop->id)
                        ->where('event_at', '>=', now()->subMinutes(15))
                        ->exists()) {
                    DB::table('transport_geofence_events')->insert([
                        'campus_id' => $vehicle->campus_id,
                        'vehicle_id' => $vehicle->id,
                        'transport_stop_id' => $stop->id,
                        'event' => 'arrived',
                        'event_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        return response()->json(['accepted' => true]);
    }

    private function distance($latitudeA, $longitudeA, $latitudeB, $longitudeB)
    {
        $radius = 6371000;
        $latitudeDelta = deg2rad($latitudeB - $latitudeA);
        $longitudeDelta = deg2rad($longitudeB - $longitudeA);
        $value = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($latitudeA)) * cos(deg2rad($latitudeB)) * sin($longitudeDelta / 2) ** 2;

        return $radius * 2 * atan2(sqrt($value), sqrt(1 - $value));
    }
}
