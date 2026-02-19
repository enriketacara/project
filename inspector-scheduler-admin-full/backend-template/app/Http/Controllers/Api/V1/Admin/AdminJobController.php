<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ListJobsRequest;
use App\Http\Requests\Api\V1\Admin\UpsertJobRequest;
use App\Http\Resources\Api\V1\JobResource;
use App\Models\Job;
use App\Services\Admin\AdminJobService;
use Illuminate\Http\JsonResponse;

class AdminJobController extends Controller
{
    public function __construct(private readonly AdminJobService $service) {}

    public function index(ListJobsRequest $request): JsonResponse
    {
        $page = $this->service->list($request->validated());
        return response()->json([
            'data' => JobResource::collection($page->items()),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    public function store(UpsertJobRequest $request): JsonResponse
    {
        $job = $this->service->create($request->validated());
        return response()->json(['data' => new JobResource($job)], 201);
    }

    public function show(Job $job): JsonResponse
    {
        $job->load(['assignment.inspector']);
        return response()->json(['data' => new JobResource($job)]);
    }

    public function update(UpsertJobRequest $request, Job $job): JsonResponse
    {
        $job = $this->service->update($job, $request->validated());
        return response()->json(['data' => new JobResource($job)]);
    }

    public function destroy(Job $job): JsonResponse
    {
        $this->service->archive($job);
        return response()->json(['message' => 'Job archived']);
    }
}
