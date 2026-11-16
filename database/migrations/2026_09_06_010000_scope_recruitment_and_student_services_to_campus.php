<?php
use Illuminate\Database\Migrations\Migration;use Illuminate\Database\Schema\Blueprint;use Illuminate\Support\Facades\{DB,Schema};
return new class extends Migration{
 private array $tables=['job_posts','applicants','homework_submissions','student_leave_requests'];
 public function up():void{foreach($this->tables as$table)if(Schema::hasTable($table)&&!Schema::hasColumn($table,'campus_id'))Schema::table($table,fn(Blueprint$b)=>$b->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete());
  DB::table('job_posts')->whereNull('campus_id')->update(['campus_id'=>DB::table('campuses')->orderBy('id')->value('id')]);
  DB::table('applicants')->whereNull('campus_id')->orderBy('id')->eachById(fn($r)=>DB::table('applicants')->where('id',$r->id)->update(['campus_id'=>DB::table('job_posts')->where('id',$r->job_post_id)->value('campus_id')]));
  DB::table('homework_submissions')->whereNull('campus_id')->orderBy('id')->eachById(fn($r)=>DB::table('homework_submissions')->where('id',$r->id)->update(['campus_id'=>DB::table('homeworks')->where('id',$r->homework_id)->value('campus_id')]));
  DB::table('student_leave_requests')->whereNull('campus_id')->orderBy('id')->eachById(fn($r)=>DB::table('student_leave_requests')->where('id',$r->id)->update(['campus_id'=>DB::table('students')->where('id',$r->student_id)->value('campus_id')]));}
 public function down():void{foreach(array_reverse($this->tables)as$table)if(Schema::hasTable($table)&&Schema::hasColumn($table,'campus_id'))Schema::table($table,fn(Blueprint$b)=>$b->dropConstrainedForeignId('campus_id'));}
};
