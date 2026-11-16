<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::create('official_document_templates',function(Blueprint $t){$t->id();$t->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();$t->string('name');$t->string('document_type')->index();$t->string('title');$t->text('body_template');$t->text('instructions')->nullable();$t->string('signature_1')->default('Principal');$t->string('signature_2')->nullable();$t->string('orientation',20)->default('portrait');$t->boolean('is_active')->default(true);$t->timestamps();});
  Schema::create('official_documents',function(Blueprint $t){$t->id();$t->foreignId('campus_id')->nullable()->constrained()->nullOnDelete();$t->foreignId('official_document_template_id')->constrained()->restrictOnDelete();$t->string('document_no')->unique();$t->string('recipient_type',20);$t->unsignedBigInteger('recipient_id');$t->string('recipient_name');$t->date('issue_date');$t->json('field_values')->nullable();$t->longText('rendered_body');$t->string('status',20)->default('issued');$t->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();$t->timestamps();$t->index(['recipient_type','recipient_id']);});
 }
 public function down():void{Schema::dropIfExists('official_documents');Schema::dropIfExists('official_document_templates');}
};
