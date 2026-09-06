<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $query = Exam::query()->orderBy('start_date', 'desc');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        return Inertia::render('Admin/Exams/Index', [
            'exams' => $query->paginate(\App\Support\PerPage::resolve(15))->withQueryString(),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['results_published_at'] = $data['results_published'] ? now() : null;
        Exam::create($data);

        return back()->with('success', 'পরীক্ষা সফলভাবে তৈরি করা হয়েছে।');
    }

    public function update(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        $data = $this->validateData($request);
        $data['results_published_at'] = $data['results_published']
            ? ($exam->results_published_at ?? now())
            : null;
        $exam->update($data);

        return back()->with('success', 'পরীক্ষার তথ্য আপডেট করা হয়েছে।');
    }

    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);

        try {
            $exam->delete();
        } catch (QueryException $e) {
            return back()->with('error', 'এই পরীক্ষার সাথে শিডিউল বা অন্য তথ্য যুক্ত আছে, তাই ডিলিট করা যাচ্ছে না। আগে সংশ্লিষ্ট শিডিউল মুছে ফেলুন।');
        }

        return back()->with('success', 'পরীক্ষা মুছে ফেলা হয়েছে।');
    }

    public function workflow(Request $request, Exam $exam)
    {
        $data = $request->validate(['action' => ['required', Rule::in(['submit','approve','lock','reopen'])]]);
        $exam=DB::transaction(function()use($exam,$data,$request){$exam=Exam::whereKey($exam->id)->lockForUpdate()->firstOrFail();
        abort_if($exam->approval_status === 'locked' && $data['action'] !== 'reopen', 422, 'The result is locked.');
        $allowed=['draft'=>['submit'],'submitted'=>['approve'],'approved'=>['lock'],'locked'=>['reopen']];
        abort_unless(in_array($data['action'],$allowed[$exam->approval_status]??[],true),422,'Invalid result workflow transition.');
        abort_if($data['action']==='approve' && (int)$exam->submitted_by===(int)$request->user()->id,403,'Submitter cannot approve their own result.');
        $updates = match ($data['action']) {
            'submit' => ['approval_status'=>'submitted','submitted_by'=>$request->user()->id],
            'approve' => ['approval_status'=>'approved','approved_by'=>$request->user()->id,'approved_at'=>now()],
            'lock' => ['approval_status'=>'locked','locked_at'=>now(),'results_published'=>true,'results_published_at'=>now()],
            'reopen' => ['approval_status'=>'approved','locked_at'=>null,'results_published'=>false,'results_published_at'=>null],
        };
        $exam->update($updates);
        return $exam;});
        return back()->with('success', 'Result workflow updated.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'campus_id' => 'nullable|exists:campuses,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'results_published' => 'boolean',
        ]);
    }
}
