<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['status' => 'IMTA API funcionando correctamente.']));