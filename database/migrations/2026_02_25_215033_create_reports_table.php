<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('kaling_id')->nullable();
            $table->unsignedBigInteger('petugas_id')->nullable();
            $table->text('description');
            $table->string('photo_path');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->enum('status', ['menunggu', 'divalidasi', 'proses', 'selesai', 'ditolak'])->default('menunggu');
            $table->string('severity_level')->nullable();
            $table->enum('waste_type', ['organik', 'anorganik', 'b3', 'campuran'])->nullable();
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
