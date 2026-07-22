<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comentario extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['contenido', 'fecha', 'user_id', 'estudio_id', 'noticia_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function estudio()
    {
        return $this->belongsTo(Estudio::class);
    }

    public function noticia()
    {
        return $this->belongsTo(Noticia::class);
    }
}