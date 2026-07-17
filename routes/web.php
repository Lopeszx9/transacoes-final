<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Transacoes API está no ar. Use as rotas em /api.',
    ]);
});
