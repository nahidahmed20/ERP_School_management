<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\OfficialDocumentTemplate;
use Illuminate\Http\Request;
class OfficialDocumentTemplateController extends Controller {
 public function store(Request $r){OfficialDocumentTemplate::create($this->data($r)+['campus_id'=>config('app.active_campus_id')]);return back()->with('success','Document template created.');}
 public function update(Request $r,OfficialDocumentTemplate $official_template){$official_template->update($this->data($r));return back()->with('success','Document template updated.');}
 public function destroy(OfficialDocumentTemplate $official_template){abort_if($official_template->documents()->exists(),422,'Issued documents use this template. Disable it instead.');$official_template->delete();return back()->with('success','Document template deleted.');}
 private function data(Request $r){return $r->validate(['name'=>'required|string|max:255','document_type'=>'required|string|max:80','title'=>'required|string|max:255','body_template'=>'required|string|max:5000','instructions'=>'nullable|string|max:1000','signature_1'=>'required|string|max:100','signature_2'=>'nullable|string|max:100','orientation'=>'required|in:portrait,landscape','is_active'=>'boolean']);}
}
