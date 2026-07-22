<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Investigador extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'investigadores';

    protected $fillable = ['nivel_academico', 'area_investigacion', 'semblanza', 'foto'];

    public function user()
    {
        return $this->hasOne(User::class, 'investigador_id');
    }

    public function estudios()
    {
        return $this->hasMany(Estudio::class);
    }

    public function noticias()
    {
        return $this->hasMany(Noticia::class);
    }
}