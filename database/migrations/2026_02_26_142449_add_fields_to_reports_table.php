<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('address')->nullable()->after('longitude');
            $table->enum('waste_type', ['organik', 'anorganik', 'b3', 'campuran'])->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['address', 'waste_type']);
        });
    }
};
