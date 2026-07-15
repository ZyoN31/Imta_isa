<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->string('documento')->nullable()->after('foto');
        });
    }

    public function down(): void
    {
        Schema::table('estudios', function (Blueprint $table) {
            $table->dropColumn('documento');
        });
    }
};
