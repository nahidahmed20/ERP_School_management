<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{SmsLog, Campus};
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{Exam,SchoolClass};
use App\Services\{SmsCampaignService,SmsService};

class SmsLogController extends Controller
{
    public function index(Request $request)
    {
        $query = SmsLog::query();

        if ($search = $request->get('search')) {
            $query->where('phone_number', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
        }

        // --- Records Per Page Logic ---
        $perPageRaw = $request->get('per_page', '10');

        if ($perPageRaw === 'All') {
            $totalCount = max($query->count(), 1);
            $logs = $query->latest()->paginate($totalCount)->withQueryString();
        } else {
            $logs = $query->latest()->paginate((int) $perPageRaw)->withQueryString();
        }

        return Inertia::render('Admin/Communication/SmsLogs/Index', [
            'logs' => $logs,
            'campuses' => Campus::select('id', 'name')->get(),
            'activeCampusId' => session('active_campus_id'),
            'filters' => [
                'search' => $request->get('search', ''),
                'per_page' => $perPageRaw,
            ],
            'classes' => SchoolClass::with('sections:id,name')->where('is_active',true)->get(['id','name']),
            'exams' => Exam::latest()->get(['id','name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'recipient_name' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:20',
            'message' => 'required|string',
        ]);

        $ok=SmsService::send($validated['phone_number'],$validated['message'],$validated+['category'=>'custom','sent_by'=>$request->user()->id]);
        return back()->with($ok?'success':'error',$ok?'SMS processed successfully.':'SMS delivery failed. Check gateway settings.');
    }

    public function campaign(Request $request,SmsCampaignService $service)
    {
        $data=$request->validate(['type'=>'required|in:absent,exam_result,fee_due,notice,emergency,homework,meeting,holiday','date'=>'required_if:type,absent|nullable|date','exam_id'=>'required_if:type,exam_result|nullable|exists:exams,id','class_id'=>'nullable|exists:school_classes,id','section_id'=>'nullable|exists:sections,id','message'=>'required_unless:type,absent,exam_result,fee_due|nullable|string|max:1000']);
        $result=$service->send($data['type'],$data,$request->user()->id);
        return back()->with('success',"{$result['sent']} SMS processed; {$result['skipped']} skipped (missing number, duplicate, or failed).");
    }

    public function destroy($id)
    {
        SmsLog::findOrFail($id)->delete();
        return back()->with('success', 'SMS Log deleted.');
    }
}
