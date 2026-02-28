<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('kaling_id')->nullable()->constrained('kalings')->onDelete('set null');
            $table->foreignId('petugas_id')->nullable()->constrained('petugas')->onDelete('set null');
            $table->text('description');
            $table->string('photo_path');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->enum('status', ['menunggu', 'divalidasi', 'proses', 'selesai', 'ditolak'])->default('menunggu');
            $table->string('severity_level')->nullable();
            $table->string('waste_type')->nullable();
            $table->string('resolved_photo_path')->nullable();
            $table->text('resolved_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
