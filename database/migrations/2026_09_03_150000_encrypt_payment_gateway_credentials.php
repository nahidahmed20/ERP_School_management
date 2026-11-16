<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('payment_gateways')->orderBy('id')->each(function ($gateway) {
            $updates = [];
            foreach (['api_key', 'api_secret', 'webhook_secret'] as $field) {
                if (! empty($gateway->{$field})) {
                    try {
                        Crypt::decryptString($gateway->{$field});
                    } catch (Throwable) {
                        $updates[$field] = Crypt::encryptString($gateway->{$field});
                    }
                }
            }
            if ($updates) DB::table('payment_gateways')->where('id', $gateway->id)->update($updates);
        });
    }

    public function down(): void
    {
        DB::table('payment_gateways')->orderBy('id')->each(function ($gateway) {
            $updates = [];
            foreach (['api_key', 'api_secret', 'webhook_secret'] as $field) {
                if (! empty($gateway->{$field})) {
                    try { $updates[$field] = Crypt::decryptString($gateway->{$field}); } catch (Throwable) {}
                }
            }
            if ($updates) DB::table('payment_gateways')->where('id', $gateway->id)->update($updates);
        });
    }
};
