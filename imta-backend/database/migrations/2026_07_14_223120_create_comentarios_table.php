<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comentarios', function (Blueprint $table) {
            $table->id();
            $table->text('contenido');
            $table->dateTime('fecha');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('estudio_id')->nullable()->constrained('estudios')->onDelete('cascade');
            $table->foreignId('noticia_id')->nullable()->constrained('noticias')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comentarios');
    }
};