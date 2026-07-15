<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Noticia extends Model
{
    use HasFactory;

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