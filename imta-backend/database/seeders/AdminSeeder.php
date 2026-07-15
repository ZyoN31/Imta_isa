<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nombre' => 'Admin IMTA',
            'apellido_paterno' => 'Laboratorio',
            'apellido_materno' => 'Enzo Levi',
            'email' => 'admin@imta.gob.mx',
            'password' => 'imta2026',
            'rol' => 'administrador',
            'investigador_id' => null,
        ]);
    }
}