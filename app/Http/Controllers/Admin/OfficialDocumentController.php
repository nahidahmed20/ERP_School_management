<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\{OfficialDocument,OfficialDocumentTemplate,Student,Staff};
use App\Services\WebsiteSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OfficialDocumentController extends Controller {
 public function index(Request $r,WebsiteSettingsService $site){
  $q=OfficialDocument::with('template')->latest();if($r->filled('search'))$q->where(fn($x)=>$x->where('document_no','like',"%{$r->search}%")->orWhere('recipient_name','like',"%{$r->search}%"));
  return Inertia::render('Admin/Documents/OfficialDocuments/Index',['documents'=>$q->paginate(12)->withQueryString(),'templates'=>OfficialDocumentTemplate::where('is_active',true)->orderBy('document_type')->get(),'students'=>Student::with(['currentEnrollment.schoolClass:id,name','currentEnrollment.section:id,name'])->where('status',true)->get(['id','first_name','last_name','admission_no']),'staffList'=>Staff::with('designation:id,name')->where('is_active',true)->get(['id','first_name','last_name','staff_id_no','designation_id']),'siteSettings'=>$site->values(),'filters'=>$r->only('search')]);
 }
 public function store(Request $r,WebsiteSettingsService $site){$d=$r->validate(['official_document_template_id'=>'required|exists:official_document_templates,id','recipient_type'=>'required|in:student,staff','recipient_id'=>'required|integer','issue_date'=>'required|date','purpose'=>'nullable|string|max:255','remarks'=>'nullable|string|max:1000']);$person=$d['recipient_type']==='student'?Student::with('currentEnrollment.schoolClass')->findOrFail($d['recipient_id']):Staff::with('designation')->findOrFail($d['recipient_id']);$name=trim($person->first_name.' '.$person->last_name);$tpl=OfficialDocumentTemplate::findOrFail($d['official_document_template_id']);$values=['{{name}}'=>$name,'{{id}}'=>$person->admission_no??$person->staff_id_no,'{{class}}'=>$person->currentEnrollment?->schoolClass?->name??'','{{designation}}'=>$person->designation?->name??'','{{date}}'=>date('d F Y',strtotime($d['issue_date'])),'{{school_name}}'=>$site->values()['school_name'],'{{purpose}}'=>$d['purpose']??'','{{remarks}}'=>$d['remarks']??''];OfficialDocument::create(['campus_id'=>config('app.active_campus_id'),'official_document_template_id'=>$tpl->id,'document_no'=>'DOC-'.now()->format('ymd').'-'.strtoupper(Str::random(6)),'recipient_type'=>$d['recipient_type'],'recipient_id'=>$person->id,'recipient_name'=>$name,'issue_date'=>$d['issue_date'],'field_values'=>['purpose'=>$d['purpose']??null,'remarks'=>$d['remarks']??null],'rendered_body'=>strtr($tpl->body_template,$values),'issued_by'=>$r->user()->id]);return back()->with('success','Official document issued successfully.');}
 public function destroy(OfficialDocument $official){$official->delete();return back()->with('success','Official document deleted.');}
}
