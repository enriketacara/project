<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ListInspectorsRequest;
use App\Http\Requests\Api\V1\Admin\UpsertInspectorRequest;
use App\Http\Resources\Api\V1\Admin\InspectorResource;
use App\Http\Resources\Api\V1\Admin\InspectorWithStatsResource;
use App\Models\User;
use App\Services\Admin\AdminInspectorService;
use Illuminate\Http\JsonResponse;

class AdminInspectorController extends Controller
{
    public function __construct(private readonly AdminInspectorService $service) {}

    public function index(ListInspectorsRequest $request): JsonResponse
    {
        $page = $this->service->list($request->validated());
        return response()->json([
            'data' => InspectorWithStatsResource::collection($page->items()),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ]
        ]);
    }

    public function store(UpsertInspectorRequest $request): JsonResponse
    {
        $inspector = $this->service->create($request->validated());
        return response()->json(['data' => new InspectorResource($inspector)], 201);
    }

    public function show(User $inspector): JsonResponse
    {
        return response()->json(['data' => new InspectorResource($inspector)]);
    }

    public function update(UpsertInspectorRequest $request, User $inspector): JsonResponse
    {
        $inspector = $this->service->update($inspector, $request->validated());
        return response()->json(['data' => new InspectorResource($inspector)]);
    }

    public function destroy(User $inspector): JsonResponse
    {
        $this->service->deactivate($inspector);
        return response()->json(['message' => 'Inspector deactivated']);
    }
}
