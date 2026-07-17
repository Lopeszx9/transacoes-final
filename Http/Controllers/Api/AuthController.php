<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login simples: e-mail + senha.
     * Retorna token Bearer (Sanctum) para autenticar as próximas requisições.
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'E-mail ou senha inválidos.',
            ], 401);
        }

        // Revoga tokens antigos (opcional, evita acúmulo) e cria um novo.
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Retorna o usuário autenticado (útil pro front saber quem está logado).
     */
    public function me()
    {
        return new UserResource(Auth::user());
    }

    /**
     * Logout: revoga apenas o token atual.
     */
    public function logout()
    {
        $user = Auth::user();
        $user->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }
}
