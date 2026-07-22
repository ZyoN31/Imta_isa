<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('investigadores', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('estudios', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('noticias', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('comentarios', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('investigadores', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('estudios', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('noticias', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('comentarios', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
