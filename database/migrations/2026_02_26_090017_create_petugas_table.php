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
        Schema::create('petugas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('jenis_kendaraan', ['truk_besar', 'pickup', 'motor_gerobak']);
            $table->string('plat_nomor')->nullable();
            $table->integer('kapasitas_kg')->default(0);
            $table->boolean('is_aktif')->default(false);
            $table->decimal('latitude_sekarang', 10, 8)->nullable();
            $table->decimal('longitude_sekarang', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petugas');
    }
};
