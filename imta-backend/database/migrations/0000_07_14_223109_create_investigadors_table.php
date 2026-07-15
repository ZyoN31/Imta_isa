<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investigadores', function (Blueprint $table) {
            $table->id();
            $table->string('nivel_academico', 100);
            $table->string('area_investigacion', 150);
            $table->text('semblanza');
            $table->string('foto')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investigadores');
    }
};