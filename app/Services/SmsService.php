<?php

namespace App\Services;

use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public static function send($number, $message)
    {
        if (empty($number)) {
            return false;
        }

        $url = "http://sms.your-sms-gateway.com/api.php";
        $apiKey = "YOUR_API_KEY";
        $senderId = "YOUR_SENDER_ID";

        try {
            /* 
            $response = Http::get($url, [
                'api_key' => $apiKey,
                'senderid' => $senderId,
                'number' => $number,
                'message' => $message
            ]);

            if ($response->successful()) {
                SmsLog::create([
                    'phone' => $number,
                    'message' => $message,
                    'status' => 'Success'
                ]);
                return true;
            } else {
                SmsLog::create([
                    'phone' => $number,
                    'message' => $message,
                    'status' => 'Failed'
                ]);
                return false;
            }
            */

            Log::info("SMS SENT TO: {$number} | MESSAGE: {$message}");
            
            SmsLog::create([
                'phone' => $number,
                'message' => $message,
                'status' => 'Success'
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error("SMS Sending Failed: " . $e->getMessage());
            
            SmsLog::create([
                'phone' => $number,
                'message' => $message,
                'status' => 'Failed'
            ]);

            return false;
        }
    }
}