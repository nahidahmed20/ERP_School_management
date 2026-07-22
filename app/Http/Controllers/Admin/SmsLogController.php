<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SmsLog;
use Inertia\Inertia;

class SmsLogController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sms/Logs', [
            'logs' => SmsLog::latest()->paginate(15)
        ]);
    }
}
