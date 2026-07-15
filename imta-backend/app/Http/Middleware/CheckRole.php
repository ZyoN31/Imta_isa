<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (! in_array($request->user()->rol, $roles, true)) {
            return response()->json([
                'message' => 'No tienes autorización para acceder a esta sección del IMTA.',
            ], 403);
        }

        return $next($request);
    }
}