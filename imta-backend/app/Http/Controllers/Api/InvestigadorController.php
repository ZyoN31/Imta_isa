<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investigador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvestigadorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Investigador::with('user')->get(), 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nivel_academico' => 'required|string|max:100',
            'area_investigacion' => 'required|string|max:150',
            'semblanza' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = Storage::url($request->file('foto')->store('investigadores', 'public'));
        }

        $investigador = Investigador::create($validated);

        return response()->json([
            'message' => 'Investigador registrado con éxito.',
            'data' => $investigador,
        ], 201);
    }

    public function show(Investigador $investigador): JsonResponse
    {
        return response()->json($investigador->load(['user', 'estudios', 'noticias']), 200);
    }

    public function update(Request $request, Investigador $investigador): JsonResponse
    {
        $validated = $request->validate([
            'nivel_academico' => 'required|string|max:100',
            'area_investigacion' => 'required|string|max:150',
            'semblanza' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        if ($request->hasFile('foto')) {
            $this->eliminarFoto($investigador->foto);
            $validated['foto'] = Storage::url($request->file('foto')->store('investigadores', 'public'));
        }

        $investigador->update($validated);

        return response()->json([
            'message' => 'Investigador actualizado con éxito.',
            'data' => $investigador,
        ], 200);
    }

    public function destroy(Investigador $investigador): JsonResponse
    {
        $this->eliminarFoto($investigador->foto);
        $investigador->delete();

        return response()->json(['message' => 'Investigador eliminado de los registros.'], 200);
    }

    private function eliminarFoto(?string $url): void
    {
        if ($url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $url));
        }
    }
}