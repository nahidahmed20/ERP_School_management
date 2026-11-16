<?php
use Illuminate\Database\Migrations\Migration;use Illuminate\Database\Schema\Blueprint;use Illuminate\Support\Facades\Schema;
return new class extends Migration{
 public function up():void{
  Schema::table('payment_refunds',function(Blueprint$t){$t->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();$t->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();$t->timestamp('approved_at')->nullable();});
  Schema::table('exams',fn(Blueprint$t)=>$t->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete());
 }
 public function down():void{Schema::table('exams',fn(Blueprint$t)=>$t->dropConstrainedForeignId('submitted_by'));Schema::table('payment_refunds',function(Blueprint$t){$t->dropConstrainedForeignId('requested_by');$t->dropConstrainedForeignId('approved_by');$t->dropColumn('approved_at');});}
};
