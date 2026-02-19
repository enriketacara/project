<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ListInspectorJobsRequest;
use App\Http\Resources\Api\V1\JobResource;
use App\Models\User;
use App\Services\Admin\AdminInspectorJobsService;
use Illuminate\Http\JsonResponse;

class AdminInspectorJobsController extends Controller
{
    public function __construct(private readonly AdminInspectorJobsService $service) {}

    public function index(ListInspectorJobsRequest $request, User $inspector): JsonResponse
    {
        $page = $this->service->listJobsForInspector($inspector, $request->validated());
        return response()->json([
            'data' => JobResource::collection($page->items()),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }
}
