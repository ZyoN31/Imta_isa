<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comentario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComentarioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Comentario::with(['user', 'estudio', 'noticia'])
                ->latest('fecha')
                ->latest()
                ->get(),
            200
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contenido' => 'required|string',
            'estudio_id' => 'nullable|exists:estudios,id|required_without:noticia_id',
            'noticia_id' => 'nullable|exists:noticias,id|required_without:estudio_id',
        ]);

        $comentario = Comentario::create([
            'contenido' => $validated['contenido'],
            'fecha' => now(),
            'user_id' => $request->user()->id,
            'estudio_id' => $validated['estudio_id'] ?? null,
            'noticia_id' => $validated['noticia_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Comentario publicado con éxito.',
            'data' => $comentario->load('user'),
        ], 201);
    }

    public function destroy(Request $request, Comentario $comentario): JsonResponse
    {
        $esDueno = $request->user()->id === $comentario->user_id;
        $esAdmin = $request->user()->rol === 'administrador';

        if (! $esDueno && ! $esAdmin) {
            return response()->json(['message' => 'No tienes autorización para eliminar este comentario.'], 403);
        }

        $comentario->delete();

        return response()->json(['message' => 'Comentario eliminado.'], 200);
    }
}