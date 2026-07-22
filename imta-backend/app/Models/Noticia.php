<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Noticia extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['titulo', 'contenido', 'fecha', 'foto', 'investigador_id'];

    public function investigador()
    {
        return $this->belongsTo(Investigador::class);
    }

    public function comentarios()
    {
        return $this->hasMany(Comentario::class);
    }
}