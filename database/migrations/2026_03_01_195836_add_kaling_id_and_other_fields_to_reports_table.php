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
            if (!Schema::hasColumn('reports', 'kaling_id')) {
                $table->unsignedBigInteger('kaling_id')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('reports', 'petugas_id')) {
                $table->unsignedBigInteger('petugas_id')->nullable()->after('kaling_id');
            }
            if (!Schema::hasColumn('reports', 'severity_level')) {
                $table->string('severity_level')->nullable()->after('status');
            }
            if (!Schema::hasColumn('reports', 'resolved_photo_path')) {
                $table->string('resolved_photo_path')->nullable()->after('waste_type');
            }
            if (!Schema::hasColumn('reports', 'resolved_notes')) {
                $table->text('resolved_notes')->nullable()->after('resolved_photo_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $columns = ['kaling_id', 'petugas_id', 'severity_level', 'resolved_photo_path', 'resolved_notes'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('reports', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
