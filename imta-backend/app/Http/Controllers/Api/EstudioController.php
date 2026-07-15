<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EstudioController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Estudio::with('investigador.user')->latest()->get(), 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|string|max:100',
            'investigador_id' => 'required|exists:investigadores,id',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = Storage::url($request->file('foto')->store('estudios', 'public'));
        }

        $estudio = Estudio::create($validated);

        return response()->json([
            'message' => 'Estudio científico publicado con éxito.',
            'data' => $estudio,
        ], 201);
    }

    public function show(Estudio $estudio): JsonResponse
    {
        return response()->json($estudio->load('investigador.user', 'comentarios.user'), 200);
    }

    public function update(Request $request, Estudio $estudio): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|string|max:100',
            'investigador_id' => 'required|exists:investigadores,id',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        if ($request->hasFile('foto')) {
            $this->eliminarFoto($estudio->foto);
            $validated['foto'] = Storage::url($request->file('foto')->store('estudios', 'public'));
        }

        $estudio->update($validated);

        return response()->json([
            'message' => 'Estudio científico actualizado con éxito.',
            'data' => $estudio,
        ], 200);
    }

    public function destroy(Estudio $estudio): JsonResponse
    {
        $this->eliminarFoto($estudio->foto);
        $estudio->delete();

        return response()->json(['message' => 'Estudio eliminado de los registros.'], 200);
    }

    private function eliminarFoto(?string $url): void
    {
        if ($url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $url));
        }
    }
}