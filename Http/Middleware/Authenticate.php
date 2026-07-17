<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Como essa aplicação é uma API pura (sem telas de login em Blade),
     * nunca redirecionamos: sempre deixamos estourar a exceção de autenticação,
     * que é convertida em JSON 401 pelo bootstrap/app.php.
     */
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
