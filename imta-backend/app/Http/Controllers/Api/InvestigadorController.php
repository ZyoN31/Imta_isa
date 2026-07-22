<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investigador;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
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
            'nombre' => 'required|string|max:50',
            'apellido_paterno' => 'required|string|max:50',
            'apellido_materno' => 'nullable|string|max:50',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'nivel_academico' => 'required|string|max:100',
            'area_investigacion' => 'required|string|max:150',
            'semblanza' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        $fotoUrl = null;

        if ($request->hasFile('foto')) {
            $fotoUrl = Storage::url($request->file('foto')->store('investigadores', 'public'));
        }

        $investigador = DB::transaction(function () use ($validated, $fotoUrl) {
            $investigador = Investigador::create([
                'nivel_academico' => $validated['nivel_academico'],
                'area_investigacion' => $validated['area_investigacion'],
                'semblanza' => $validated['semblanza'],
                'foto' => $fotoUrl,
            ]);

            User::create([
                'nombre' => $validated['nombre'],
                'apellido_paterno' => $validated['apellido_paterno'],
                'apellido_materno' => $validated['apellido_materno'] ?? null,
                'email' => $validated['email'],
                'password' => $validated['password'],
                'rol' => 'investigador',
                'investigador_id' => $investigador->id,
            ]);

            return $investigador->load('user');
        });

        return response()->json([
            'message' => 'Investigador y cuenta registrados con éxito.',
            'data' => $investigador,
        ], 201);
    }

    public function show(Investigador $investigador): JsonResponse
    {
        return response()->json($investigador->load(['user', 'estudios', 'noticias']), 200);
    }

    public function update(Request $request, Investigador $investigador): JsonResponse
    {
        $user = $investigador->user;

        $validated = $request->validate([
            'nivel_academico' => 'required|string|max:100',
            'area_investigacion' => 'required|string|max:150',
            'semblanza' => 'required|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
            'nombre' => 'sometimes|required|string|max:50',
            'apellido_paterno' => 'sometimes|required|string|max:50',
            'apellido_materno' => 'nullable|string|max:50',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->hasFile('foto')) {
            $this->eliminarFoto($investigador->foto);
            $validated['foto'] = Storage::url($request->file('foto')->store('investigadores', 'public'));
        }

        DB::transaction(function () use ($investigador, $validated, $user) {
            $investigador->update([
                'nivel_academico' => $validated['nivel_academico'],
                'area_investigacion' => $validated['area_investigacion'],
                'semblanza' => $validated['semblanza'],
                'foto' => $validated['foto'] ?? $investigador->foto,
            ]);

            if ($user) {
                $updates = [];

                if (array_key_exists('nombre', $validated)) {
                    $updates['nombre'] = $validated['nombre'];
                }
                if (array_key_exists('apellido_paterno', $validated)) {
                    $updates['apellido_paterno'] = $validated['apellido_paterno'];
                }
                if (array_key_exists('apellido_materno', $validated)) {
                    $updates['apellido_materno'] = $validated['apellido_materno'];
                }
                if (array_key_exists('email', $validated)) {
                    $updates['email'] = $validated['email'];
                }
                if (! empty($validated['password'])) {
                    $updates['password'] = $validated['password'];
                }

                if (! empty($updates)) {
                    $user->update($updates);
                }
            }
        });

        return response()->json([
            'message' => 'Investigador actualizado con éxito.',
            'data' => $investigador->fresh()->load('user'),
        ], 200);
    }

    public function destroy(Investigador $investigador): JsonResponse
    {
        $this->eliminarFoto($investigador->foto);
        $investigador->user()->delete();
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