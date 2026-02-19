<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminDashboardService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(private readonly AdminDashboardService $service) {}

    public function show(): JsonResponse
    {
        return response()->json(['data' => $this->service->summary()]);
    }
}
