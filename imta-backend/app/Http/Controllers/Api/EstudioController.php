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
        $isResearcher = $request->user()->rol === 'investigador';

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|string|max:100',
            'investigador_id' => ($isResearcher ? 'nullable' : 'required').'|exists:investigadores,id',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
            'documento' => 'required|file|mimes:pdf,doc,docx|max:10240',
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
            $validated['foto'] = Storage::url($request->file('foto')->store('estudios', 'public'));
        }

        $validated['documento'] = Storage::url($request->file('documento')->store('estudios/documentos', 'public'));

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
        $isResearcher = $request->user()->rol === 'investigador';

        if ($isResearcher && (int) $estudio->investigador_id !== (int) $request->user()->investigador_id) {
            return response()->json(['message' => 'Solo puedes editar estudios publicados por tu cuenta.'], 403);
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|string|max:100',
            'investigador_id' => ($isResearcher ? 'nullable' : 'required').'|exists:investigadores,id',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
            'documento' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
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
            $this->eliminarArchivo($estudio->foto);
            $validated['foto'] = Storage::url($request->file('foto')->store('estudios', 'public'));
        }

        if ($request->hasFile('documento')) {
            $this->eliminarArchivo($estudio->documento);
            $validated['documento'] = Storage::url($request->file('documento')->store('estudios/documentos', 'public'));
        }

        $estudio->update($validated);

        return response()->json([
            'message' => 'Estudio científico actualizado con éxito.',
            'data' => $estudio,
        ], 200);
    }

    public function destroy(Request $request, Estudio $estudio): JsonResponse
    {
        $isResearcher = $request->user()->rol === 'investigador';

        if ($isResearcher && (int) $estudio->investigador_id !== (int) $request->user()->investigador_id) {
            return response()->json(['message' => 'Solo puedes eliminar estudios publicados por tu cuenta.'], 403);
        }

        $this->eliminarArchivo($estudio->foto);
        $this->eliminarArchivo($estudio->documento);
        $estudio->delete();

        return response()->json(['message' => 'Estudio eliminado de los registros.'], 200);
    }

    private function eliminarArchivo(?string $url): void
    {
        if ($url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $url));
        }
    }
}