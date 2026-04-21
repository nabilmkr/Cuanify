<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('notifications_enabled')->default(true)->after('avatar_url');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'notifications_enabled')) {
            return;
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('notifications_enabled');
        });
    }
};
