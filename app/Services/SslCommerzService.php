<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SslCommerzService
{
    public function createSession(Invoice $invoice, Student $student, string $transactionId, float $amount): string
    {
        $response = $this->client()->asForm()->post($this->baseUrl().'/gwprocess/v4/api.php', [
            'store_id' => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'total_amount' => number_format($amount, 2, '.', ''),
            'currency' => 'BDT',
            'tran_id' => $transactionId,
            'success_url' => route('payments.sslcommerz.success'),
            'fail_url' => route('payments.sslcommerz.fail'),
            'cancel_url' => route('payments.sslcommerz.cancel'),
            'ipn_url' => route('payments.sslcommerz.ipn'),
            'cus_name' => trim($student->first_name.' '.$student->last_name),
            'cus_email' => $student->email ?: 'guardian@example.com',
            'cus_phone' => $student->phone ?: $student->guardian?->father_phone ?: '01700000000',
            'cus_add1' => $student->current_address ?: 'Bangladesh',
            'cus_city' => 'Dhaka', 'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO',
            'product_name' => 'School fee '.$invoice->invoice_no,
            'product_category' => 'Education', 'product_profile' => 'non-physical-goods',
            'value_a' => (string) $invoice->id,
        ]);

        $url = $response->successful() ? $response->json('GatewayPageURL') : null;
        if (! $url) throw new RuntimeException('SSLCommerz session could not be created.');
        return $url;
    }

    public function validate(string $validationId): array
    {
        $response = $this->client()->get($this->baseUrl().'/validator/api/validationserverAPI.php', [
            'val_id' => $validationId,
            'store_id' => config('services.sslcommerz.store_id'),
            'store_passwd' => config('services.sslcommerz.store_password'),
            'v' => 1, 'format' => 'json',
        ]);
        if (! $response->successful()) throw new RuntimeException('SSLCommerz validation failed.');
        return $response->json();
    }

    private function client(): PendingRequest
    {
        if (! config('services.sslcommerz.store_id') || ! config('services.sslcommerz.store_password')) {
            throw new RuntimeException('SSLCommerz credentials are not configured.');
        }
        return Http::timeout(20)->retry(2, 300)->acceptJson();
    }

    private function baseUrl(): string
    {
        return config('services.sslcommerz.sandbox')
            ? 'https://sandbox.sslcommerz.com'
            : 'https://securepay.sslcommerz.com';
    }
}
