<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Inspection\Services\JobClaimService;
use App\Domain\Inspection\Services\JobCompletionService;
use App\Domain\Inspection\Services\JobQueryService;
use App\Domain\Inspection\Services\JobScheduleService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Jobs\ClaimJobRequest;
use App\Http\Requests\Api\V1\Jobs\CompleteJobRequest;
use App\Http\Requests\Api\V1\Jobs\ScheduleJobRequest;
use App\Http\Resources\Api\V1\JobResource;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Jobs")]
class JobController extends Controller
{
    public function __construct(
        private readonly JobQueryService $queryService,
        private readonly JobClaimService $claimService,
        private readonly JobScheduleService $scheduleService,
        private readonly JobCompletionService $completionService,
    ) {}

    #[OA\Get(
        path: "/api/v1/jobs",
        summary: "List jobs (filter by status)",
        tags: ["Jobs"],
        parameters: [
            new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["OFFERED","CLAIMED","COMPLETED","CANCELLED"])),
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer")),
        ],
        responses: [new OA\Response(response: 200, description: "Paginated jobs")]
    )]
    public function index(): JsonResponse
    {
        $status = request()->query('status');
        $page = $this->queryService->paginate($status);

        return response()->json([
            'data' => JobResource::collection($page->items()),
            'meta' => [
                'page'     => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total'    => $page->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: "/api/v1/jobs/{job}",
        summary: "Get job details",
        tags: ["Jobs"],
        parameters: [new OA\Parameter(name: "job", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Job details"),
            new OA\Response(response: 404, description: "Not found"),
        ]
    )]
    public function show(Job $job): JsonResponse
    {
        $job->load(['assignment.inspector']);
        return response()->json([
            'data' => (new JobResource($job))->toArray(request()),
        ]);
    }

    #[OA\Post(
        path: "/api/v1/jobs/{job}/claim",
        summary: "Claim a job and set schedule date (local time)",
        security: [["bearerAuth" => []]],
        tags: ["Jobs"],
        parameters: [new OA\Parameter(name: "job", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ["scheduled_at_local"],
            properties: [new OA\Property(property: "scheduled_at_local", type: "string", example: "2026-02-18 11:00:00")]
        )),
        responses: [
            new OA\Response(response: 201, description: "Claimed"),
            new OA\Response(response: 409, description: "Conflict"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function claim(ClaimJobRequest $request, Job $job): JsonResponse
    {
        $assignment = $this->claimService->claim($job, $request->user(), $request->string('scheduled_at_local'));

        return response()->json([
            'data' => [
                'job' => [
                    'id'     => $job->id,
                    'status' => $job->fresh()->status,
                ],
                'assignment' => [
                    'id' => $assignment->id,
                    'scheduled_at_utc'   => optional($assignment->scheduled_at_utc)?->toIso8601String(),
                    'scheduled_at_local' => $request->user()->timezone ?
                        \Carbon\CarbonImmutable::parse($assignment->scheduled_at_utc)->setTimezone($request->user()->timezone)->format('Y-m-d\TH:i:s')
                        : optional($assignment->scheduled_at_utc)?->toIso8601String(),
                    'inspector_id' => $assignment->inspector_id,
                ],
            ],
        ], 201);
    }

    #[OA\Patch(
        path: "/api/v1/jobs/{job}/schedule",
        summary: "Reschedule a claimed job (owner only)",
        security: [["bearerAuth" => []]],
        tags: ["Jobs"],
        parameters: [new OA\Parameter(name: "job", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ["scheduled_at_local"],
            properties: [new OA\Property(property: "scheduled_at_local", type: "string", example: "2026-02-19 10:30:00")]
        )),
        responses: [
            new OA\Response(response: 200, description: "Rescheduled"),
            new OA\Response(response: 403, description: "Not owned"),
            new OA\Response(response: 409, description: "Invalid state"),
        ]
    )]
    public function schedule(ScheduleJobRequest $request, Job $job): JsonResponse
    {
        $job = $this->scheduleService->reschedule($job, $request->user(), $request->string('scheduled_at_local'));

        return response()->json([
            'data' => (new JobResource($job))->toArray($request),
        ]);
    }

    #[OA\Post(
        path: "/api/v1/jobs/{job}/complete",
        summary: "Complete a claimed job and provide assessment (owner only)",
        security: [["bearerAuth" => []]],
        tags: ["Jobs"],
        parameters: [new OA\Parameter(name: "job", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(
            required: ["assessment_rating"],
            properties: [
                new OA\Property(property: "assessment_rating", type: "integer", example: 4),
                new OA\Property(property: "assessment_notes", type: "string", example: "Work completed successfully.")
            ]
        )),
        responses: [
            new OA\Response(response: 200, description: "Completed"),
            new OA\Response(response: 403, description: "Not owned"),
            new OA\Response(response: 409, description: "Invalid state"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function complete(CompleteJobRequest $request, Job $job): JsonResponse
    {
        $job = $this->completionService->complete(
            $job,
            $request->user(),
            (int)$request->input('assessment_rating'),
            $request->input('assessment_notes')
        );

        return response()->json([
            'data' => (new JobResource($job))->toArray($request),
        ]);
    }
}
