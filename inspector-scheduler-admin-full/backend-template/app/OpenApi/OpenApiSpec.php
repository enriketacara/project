<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "OUR COMPANY Inspector Scheduler API",
    description: "API for inspectors to claim/schedule jobs and complete them with assessment."
)]
#[OA\Server(url: "http://127.0.0.1:8000")]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "Token"
)]
final class OpenApiSpec {}
