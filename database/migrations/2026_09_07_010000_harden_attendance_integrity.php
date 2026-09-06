<?php
use Illuminate\Database\Migrations\Migration;use Illuminate\Database\Schema\Blueprint;use Illuminate\Support\Facades\{DB,Schema};
return new class extends Migration{
 public function up():void{Schema::table('student_attendances',function(Blueprint$t){$t->time('in_time')->nullable()->after('status');$t->time('out_time')->nullable()->after('in_time');});Schema::table('attendance_correction_requests',fn(Blueprint$t)=>$t->foreignId('campus_id')->nullable()->after('id')->constrained()->nullOnDelete());DB::table('attendance_correction_requests')->orderBy('id')->eachById(fn($r)=>DB::table('attendance_correction_requests')->where('id',$r->id)->update(['campus_id'=>DB::table('students')->where('id',$r->student_id)->value('campus_id')]));}
 public function down():void{Schema::table('attendance_correction_requests',fn(Blueprint$t)=>$t->dropConstrainedForeignId('campus_id'));Schema::table('student_attendances',fn(Blueprint$t)=>$t->dropColumn(['in_time','out_time']));}
};
