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
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'needs')) {
                $table->json('needs')->nullable()->after('waste_type');
            }
            if (!Schema::hasColumn('reports', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'needs')) {
                $table->dropColumn('needs');
            }
            if (Schema::hasColumn('reports', 'city')) {
                $table->dropColumn('city');
            }
        });
    }
};
