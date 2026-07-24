<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Noticia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NoticiaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Noticia::with('investigador.user')->latest('fecha')->get(), 200);
    }

    public function store(Request $request): JsonResponse
    {
        $isResearcher = $request->user()->rol === 'investigador';

        $validated = $request->validate([
            'titulo' => 'required|string|max:200',
            'contenido' => 'required|string',
            'fecha' => 'required|date',
            'investigador_id' => ($isResearcher ? 'nullable' : 'required').'|exists:investigadores,id',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        if ($isResearcher) {
            $investigadorId = $request->user()->investigador_id;

            if (! $investigadorId) {
                return response()->json([
                    'message' => 'Tu cuenta no está vinculada a un investigador. Contacta al administrador.',
                ], 422);
            }

            $validated['investigador_id'] = $investigadorId;
        }

        if ($request->hasFile('foto')) {
            $validated['foto'] = Storage::url($request->file('foto')->store('noticias', 'public'));
        }

        $noticia = Noticia::create($validated);

        return response()->json([
            'message' => 'Noticia publicada con éxito.',
            'data' => $noticia,
        ], 201);
    }

    public function show(Noticia $noticia): JsonResponse
    {
        return response()->json($noticia->load('investigador.user', 'comentarios.user'), 200);
    }

    public function update(Request $request, Noticia $noticia): JsonResponse
    {
        $isResearcher = $request->user()->rol === 'investigador';

        if ($isResearcher && (int) $noticia->investigador_id !== (int) $request->user()->investigador_id) {
            return response()->json(['message' => 'Solo puedes editar noticias publicadas por tu cuenta.'], 403);
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:200',
            'contenido' => 'required|string',
            'fecha' => 'required|date',
            'investigador_id' => ($isResearcher ? 'nullable' : 'required').'|exists:investigadores,id',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        if ($isResearcher) {
            $investigadorId = $request->user()->investigador_id;

            if (! $investigadorId) {
                return response()->json([
                    'message' => 'Tu cuenta no está vinculada a un investigador. Contacta al administrador.',
                ], 422);
            }

            $validated['investigador_id'] = $investigadorId;
        }

        if ($request->hasFile('foto')) {
            $this->eliminarFoto($noticia->foto);
            $validated['foto'] = Storage::url($request->file('foto')->store('noticias', 'public'));
        }

        $noticia->update($validated);

        return response()->json([
            'message' => 'Noticia actualizada con éxito.',
            'data' => $noticia,
        ], 200);
    }

    public function destroy(Request $request, Noticia $noticia): JsonResponse
    {
        $isResearcher = $request->user()->rol === 'investigador';

        if ($isResearcher && (int) $noticia->investigador_id !== (int) $request->user()->investigador_id) {
            return response()->json(['message' => 'Solo puedes eliminar noticias publicadas por tu cuenta.'], 403);
        }

        $this->eliminarFoto($noticia->foto);
        $noticia->forceDelete();

        return response()->json(['message' => 'Noticia eliminada de los registros.'], 200);
    }

    private function eliminarFoto(?string $url): void
    {
        if ($url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $url));
        }
    }
}