<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
            $table->foreignId('inspector_id')->constrained('users')->cascadeOnDelete();
            $table->timestampTz('scheduled_at_utc');
            $table->timestampTz('completed_at_utc')->nullable();
            $table->unsignedTinyInteger('assessment_rating')->nullable(); // 1..5
            $table->text('assessment_notes')->nullable();
            $table->timestamps();

            $table->unique('job_id'); // prevents double-claim
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_assignments');
    }
};
