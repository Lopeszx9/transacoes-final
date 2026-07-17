<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// --- Autenticação (pública) ---
Route::post('/login', [AuthController::class, 'login']);

// --- Rotas protegidas por token (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // CRUD de transações
    Route::apiResource('transactions', TransactionController::class);
});
