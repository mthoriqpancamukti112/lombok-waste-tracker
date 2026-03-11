<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('waste_density_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('coordinates')->nullable();
            $table->enum('density_level', ['very_low', 'low', 'medium', 'high', 'very_high'])->default('medium');
            $table->string('kelurahan')->nullable();
            $table->string('kecamatan')->nullable();
            $table->integer('report_count')->default(0);
            $table->decimal('monthly_tonnage', 8, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waste_density_zones');
    }
};
