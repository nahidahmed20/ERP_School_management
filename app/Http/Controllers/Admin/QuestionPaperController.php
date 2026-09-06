<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\QuestionPaper;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Services\WebsiteSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Support\CampusRule;

class QuestionPaperController extends Controller
{
    public function index(Request $request, WebsiteSettingsService $settings)
    {
        $query = QuestionPaper::with(['schoolClass:id,name','subject:id,name,code'])->latest();
        if ($request->filled('search')) $query->where(fn($q)=>$q->where('exam_name','like',"%{$request->search}%")->orWhere('paper_code','like',"%{$request->search}%"));
        return Inertia::render('Admin/LMSQuestionPapers/Index', [
            'papers'=>$query->paginate(12)->withQueryString(), 'classes'=>SchoolClass::where('is_active',true)->get(['id','name']),
            'subjects'=>Subject::where('is_active',true)->get(['id','name','code']), 'siteSettings'=>$settings->values(),
            'filters'=>$request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data=$request->validate([
            'school_class_id'=>['required',CampusRule::exists('school_classes')],'subject_id'=>['required',CampusRule::exists('subjects')],'exam_name'=>'required|string|max:255',
            'exam_date'=>'nullable|date','duration_minutes'=>'required|integer|min:5|max:600','question_count'=>'required|integer|min:1|max:200',
            'question_type'=>'nullable|in:MCQ,True/False','instructions'=>'nullable|string|max:2000','shuffle'=>'nullable|boolean',
        ]);
        $query=QuestionBank::where('school_class_id',$data['school_class_id'])->where('subject_id',$data['subject_id'])->where('is_active',true);
        if (!empty($data['question_type'])) $query->where('question_type',$data['question_type']);
        $available=$query->count();
        if ($available < $data['question_count']) throw ValidationException::withMessages(['question_count'=>"Only {$available} matching active questions are available in the Question Bank."]);
        $questions=($request->boolean('shuffle')?$query->inRandomOrder():$query->oldest())->limit($data['question_count'])->get()->values()->map(fn($q)=>[
            'id'=>$q->id,'type'=>$q->question_type,'question'=>$q->question,'options'=>array_values(array_filter([$q->option_a,$q->option_b,$q->option_c,$q->option_d],fn($v)=>$v!==null&&$v!=='')),'marks'=>(float)$q->marks,
        ])->all();
        $paper=QuestionPaper::create([
            'campus_id'=>config('app.active_campus_id'),'school_class_id'=>$data['school_class_id'],'subject_id'=>$data['subject_id'],
            'paper_code'=>'QP-'.now()->format('ymd').'-'.strtoupper(Str::random(6)),'exam_name'=>$data['exam_name'],'exam_date'=>$data['exam_date']??null,
            'duration_minutes'=>$data['duration_minutes'],'full_marks'=>collect($questions)->sum('marks'),'instructions'=>$data['instructions']??null,
            'questions'=>$questions,'created_by'=>$request->user()->id,
        ]);
        return back()->with('success',"Question paper {$paper->paper_code} generated successfully.");
    }

    public function destroy(QuestionPaper $question_paper) { $question_paper->delete(); return back()->with('success','Question paper deleted successfully.'); }
}
