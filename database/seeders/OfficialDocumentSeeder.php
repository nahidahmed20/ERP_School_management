<?php
namespace Database\Seeders;
use App\Models\{Campus,MenuGroup,MenuItem,OfficialDocumentTemplate};
use Illuminate\Database\Seeder;
class OfficialDocumentSeeder extends Seeder {
 public function run():void{
  $templates=[
   ['testimonial','Student Testimonial','TESTIMONIAL','This is to certify that {{name}}, ID {{id}}, was a student of {{class}} at {{school_name}}. During the period of study, the student maintained good conduct and character. {{remarks}}'],
   ['transfer_certificate','Transfer / Leaving Certificate','TRANSFER CERTIFICATE','This is to certify that {{name}}, ID {{id}}, studied in {{class}} at {{school_name}}. The student is leaving the institution for: {{purpose}}. We wish the student every success.'],
   ['character_certificate','Character Certificate','CHARACTER CERTIFICATE','This is to certify that {{name}}, ID {{id}}, is/was a student of {{class}} at {{school_name}}. To the best of our knowledge, the student bears good moral character.'],
   ['bonafide_certificate','Bonafide / Studentship Certificate','BONAFIDE CERTIFICATE','This is to certify that {{name}}, ID {{id}}, is a bona fide student of {{class}} at {{school_name}}. This certificate is issued for {{purpose}}.'],
   ['fee_clearance','Fee Clearance Certificate','FEE CLEARANCE','This is to certify that {{name}}, ID {{id}}, has cleared the applicable institutional dues as of {{date}}. {{remarks}}'],
   ['admit_card','Admit Card / Entry Permit','ADMIT CARD','This document permits {{name}}, ID {{id}}, Class {{class}}, to attend the examination/activity specified as {{purpose}}.'],
   ['experience_certificate','Staff Experience Certificate','EXPERIENCE CERTIFICATE','This is to certify that {{name}}, ID {{id}}, served at {{school_name}} as {{designation}}. The certificate is issued for {{purpose}}. {{remarks}}'],
   ['appointment_letter','Appointment Letter','APPOINTMENT LETTER','Dear {{name}}, you are appointed as {{designation}} at {{school_name}} effective from {{date}}. {{remarks}}'],
  ];
  $campusIds=Campus::pluck('id');if($campusIds->isEmpty())$campusIds=collect([null]);
  foreach($campusIds as $campusId)foreach($templates as[$type,$name,$title,$body])OfficialDocumentTemplate::withoutGlobalScopes()->firstOrCreate(['document_type'=>$type,'campus_id'=>$campusId],['name'=>$name,'title'=>$title,'body_template'=>$body,'signature_1'=>'Principal','signature_2'=>'Authorized Officer','orientation'=>'portrait','is_active'=>true]);
  $g=MenuGroup::firstOrCreate(['label'=>'Documents & Certificates'],['order'=>7,'is_active'=>true]);$p=MenuItem::firstOrCreate(['key'=>'documents'],['menu_group_id'=>$g->id,'label'=>'Certificates & ID Cards','icon'=>'award','order'=>0,'is_active'=>true]);MenuItem::updateOrCreate(['key'=>'admin.documents.official.index'],['menu_group_id'=>$g->id,'parent_id'=>$p->id,'label'=>'Official Document Studio','route_name'=>'admin.documents.official.index','permission'=>'admin.documents.official.index','order'=>4,'is_active'=>true]);$p->update(['badge_count'=>$p->children()->count()]);
 }
}
