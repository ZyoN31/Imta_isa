<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estudio extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['titulo', 'descripcion', 'categoria', 'foto', 'documento', 'investigador_id'];

    public function investigador()
    {
        return $this->belongsTo(Investigador::class);
    }

    public function comentarios()
    {
        return $this->hasMany(Comentario::class);
    }
}