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
        
        if ($request->filled('search')) {
            $query->where(fn($q) => $q->where('exam_name','like',"%{$request->search}%")
                                      ->orWhere('paper_code','like',"%{$request->search}%"));
        }
        
        return Inertia::render('Admin/LMSQuestionPapers/Index', [
            'papers' => $query->paginate(12)->withQueryString(), 
            'classes' => SchoolClass::with('subjects')->where('is_active',true)->get(['id','name']),
            'subjects' => Subject::where('is_active',true)->get(['id','name','code']), 
            'allQuestions' => QuestionBank::where('is_active', true)->get(['id', 'school_class_id', 'subject_id', 'question', 'marks', 'question_type']),
            'siteSettings' => $settings->values(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data=$request->validate([
            'school_class_id'=>['required',CampusRule::exists('school_classes')],
            'subject_id'=>['required',CampusRule::exists('subjects')],
            'exam_name'=>'required|string|max:255',
            'exam_date'=>'nullable|date',
            'duration_minutes'=>'required|integer|min:5|max:600',
            'instructions'=>'nullable|string|max:2000',
            'selection_type'=>'required|in:auto,manual',
            
            // Auto Validation
            'question_count'=>'nullable|required_if:selection_type,auto|integer|min:1',
            'question_type'=>'nullable|in:MCQ,True/False',
            'shuffle'=>'nullable|boolean',
            
            // Manual Validation
            'question_ids'=>'nullable|required_if:selection_type,manual|array|min:1',
            'question_ids.*'=>'exists:question_banks,id'
        ]);

        if ($data['selection_type'] === 'manual') {
            $rawQuestions = QuestionBank::whereIn('id', $data['question_ids'])->get();
        } else {
            $query=QuestionBank::where('school_class_id',$data['school_class_id'])->where('subject_id',$data['subject_id'])->where('is_active',true);
            if (!empty($data['question_type'])) $query->where('question_type',$data['question_type']);
            
            $available=$query->count();
            if ($available < $data['question_count']) {
                throw ValidationException::withMessages(['question_count'=>"Question Bank-এ মাত্র {$available} টি প্রশ্ন এভেইলেবল আছে।"]);
            }
            $rawQuestions = ($request->boolean('shuffle')?$query->inRandomOrder():$query->oldest())->limit($data['question_count'])->get();
        }

        $questions = $rawQuestions->map(fn($q)=>[
            'id'=>$q->id,
            'type'=>$q->question_type,
            'question'=>$q->question,
            'options'=>array_values(array_filter([$q->option_a,$q->option_b,$q->option_c,$q->option_d],fn($v)=>$v!==null&&$v!=='')),
            'marks'=>(float)$q->marks,
        ])->all();

        $paper=QuestionPaper::create([
            'campus_id'=>config('app.active_campus_id'),
            'school_class_id'=>$data['school_class_id'],
            'subject_id'=>$data['subject_id'],
            'paper_code'=>'QP-'.now()->format('ymd').'-'.strtoupper(Str::random(6)),
            'exam_name'=>$data['exam_name'],
            'exam_date'=>$data['exam_date']??null,
            'duration_minutes'=>$data['duration_minutes'],
            'full_marks'=>collect($questions)->sum('marks'),
            'instructions'=>$data['instructions']??null,
            'questions'=>$questions,
            'created_by'=>$request->user()->id,
        ]);
        
        return back()->with('success',"Question paper {$paper->paper_code} generated successfully.");
    }

    public function destroy(QuestionPaper $question_paper) { 
        $question_paper->delete(); 
        return back()->with('success','Question paper deleted successfully.'); 
    }
}