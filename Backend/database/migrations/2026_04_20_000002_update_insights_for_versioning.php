<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Schema::table('insights', function (Blueprint $table): void {
                $table->dropUnique('insights_user_id_period_month_period_year_unique');
            });
        } catch (\Throwable $exception) {
            // Index might not exist in some environments.
        }

        Schema::table('insights', function (Blueprint $table): void {
            $table->string('ml_prediction')->nullable()->after('recommendations');
            $table->json('data_analyzed')->nullable()->after('ml_prediction');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('insights', 'ml_prediction')) {
            Schema::table('insights', function (Blueprint $table): void {
                $table->dropColumn('ml_prediction');
            });
        }

        if (Schema::hasColumn('insights', 'data_analyzed')) {
            Schema::table('insights', function (Blueprint $table): void {
                $table->dropColumn('data_analyzed');
            });
        }

        Schema::table('insights', function (Blueprint $table): void {
            $table->unique(['user_id', 'period_month', 'period_year']);
        });
    }
};
