<?php

namespace App\Exceptions;

use App\Domain\Inspection\Exceptions\DomainException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (DomainException $e, $request) {
            return response()->json([
                'message' => $e->publicMessage,
                'code'    => $e->publicCode,
                'errors'  => (object)[],
            ], $e->httpStatus);
        });
    }
}
