<?php

return [
    'sslcommerz' => [
        'store_id' => env('SSLCOMMERZ_STORE_ID'),
        'store_password' => env('SSLCOMMERZ_STORE_PASSWORD'),
        'sandbox' => env('SSLCOMMERZ_SANDBOX', true),
    ],
    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'url' => env('SMS_URL'),
        'api_key' => env('SMS_API_KEY'),
        'sender_id' => env('SMS_SENDER_ID'),
        'balance_url' => env('SMS_BALANCE_URL'),
        'webhook_secret' => env('SMS_WEBHOOK_SECRET'),
        'cost_per_segment' => env('SMS_COST_PER_SEGMENT', 0),
    ],
    'whatsapp' => ['driver'=>env('WHATSAPP_DRIVER','log'),'url'=>env('WHATSAPP_URL'),'balance_url'=>env('WHATSAPP_BALANCE_URL'),'api_key'=>env('WHATSAPP_API_KEY'),'sender_id'=>env('WHATSAPP_SENDER_ID'),'webhook_secret'=>env('WHATSAPP_WEBHOOK_SECRET')],
    'push' => ['driver'=>env('PUSH_DRIVER','log'),'url'=>env('PUSH_URL'),'balance_url'=>env('PUSH_BALANCE_URL'),'api_key'=>env('PUSH_API_KEY'),'webhook_secret'=>env('PUSH_WEBHOOK_SECRET')],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'government_holidays' => [
        'feed_url' => env('GOVERNMENT_HOLIDAY_FEED_URL'),
    ],

];
