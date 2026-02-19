<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\Api\V1\AuthTokenResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Auth")]
class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/v1/auth/login",
        summary: "Login and receive Sanctum token",
        tags: ["Auth"],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ["email","password"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "uk.inspector@company.test"),
                new OA\Property(property: "password", type: "string", example: "Password123!")
            ]
        )),
        responses: [
            new OA\Response(response: 200, description: "Token issued"),
            new OA\Response(response: 401, description: "Invalid credentials"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (!$user || !Hash::check($request->string('password'), $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
                'code'    => 'AUTH_INVALID_CREDENTIALS',
                'errors'  => (object)[],
            ], 401);
        }

        
if (($user->active ?? true) === false) {
    return response()->json([
        'message' => 'User is inactive.',
        'code'    => 'AUTH_INACTIVE_USER',
        'errors'  => (object)[],
    ], 403);
}

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'data' => (new AuthTokenResource($token, $user))->toArray($request),
        ]);
    }

    #[OA\Post(
        path: "/api/v1/auth/logout",
        summary: "Logout (revoke current token)",
        security: [["bearerAuth" => []]],
        tags: ["Auth"],
        responses: [new OA\Response(response: 204, description: "Logged out")]
    )]
    public function logout(): JsonResponse
    {
        $user = request()->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
        }
        return response()->json([], 204);
    }
}
