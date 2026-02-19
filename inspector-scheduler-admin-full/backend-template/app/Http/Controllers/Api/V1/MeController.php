<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\InspectorResource;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Me")]
class MeController extends Controller
{
    #[OA\Get(
        path: "/api/v1/me",
        summary: "Get current inspector profile",
        security: [["bearerAuth" => []]],
        tags: ["Me"],
        responses: [new OA\Response(response: 200, description: "Inspector profile")]
    )]
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => (new InspectorResource(request()->user()))->toArray(request()),
        ]);
    }
}
