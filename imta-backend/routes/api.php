<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComentarioController;
use App\Http\Controllers\Api\EstudioController;
use App\Http\Controllers\Api\InvestigadorController;
use App\Http\Controllers\Api\NoticiaController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/investigadores', [InvestigadorController::class, 'index']);
Route::get('/investigadores/{investigador}', [InvestigadorController::class, 'show']);
Route::get('/estudios', [EstudioController::class, 'index']);
Route::get('/estudios/{estudio}', [EstudioController::class, 'show']);
Route::get('/noticias', [NoticiaController::class, 'index']);
Route::get('/noticias/{noticia}', [NoticiaController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateMe']);

    Route::post('/comentarios', [ComentarioController::class, 'store']);
    Route::put('/comentarios/{comentario}', [ComentarioController::class, 'update']);
    Route::delete('/comentarios/{comentario}', [ComentarioController::class, 'destroy']);

    Route::middleware('role:administrador,investigador')->group(function () {
        Route::post('/estudios', [EstudioController::class, 'store']);
        Route::put('/estudios/{estudio}', [EstudioController::class, 'update']);
        Route::delete('/estudios/{estudio}', [EstudioController::class, 'destroy']);

        Route::post('/noticias', [NoticiaController::class, 'store']);
        Route::put('/noticias/{noticia}', [NoticiaController::class, 'update']);
        Route::delete('/noticias/{noticia}', [NoticiaController::class, 'destroy']);
    });

    Route::middleware('role:administrador')->group(function () {
        Route::get('/admin/consultores', [AuthController::class, 'consultores']);
        Route::delete('/admin/consultores/{user}', [AuthController::class, 'destroyConsultor']);
        Route::get('/admin/comentarios', [ComentarioController::class, 'index']);

        Route::post('/investigadores', [InvestigadorController::class, 'store']);
        Route::put('/investigadores/{investigador}', [InvestigadorController::class, 'update']);
        Route::delete('/investigadores/{investigador}', [InvestigadorController::class, 'destroy']);
    });
});