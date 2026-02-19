<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MyJobs\MyJobsIndexRequest;
use App\Http\Resources\Api\V1\JobResource;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "My Jobs")]
class MyJobsController extends Controller
{
    #[OA\Get(
        path: "/api/v1/my/jobs",
        summary: "List jobs claimed/completed by current inspector",
        security: [["bearerAuth" => []]],
        tags: ["My Jobs"],
        parameters: [
            new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["CLAIMED","COMPLETED"])),
            new OA\Parameter(name: "from", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "to", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 200, description: "Paginated jobs")]
    )]
    public function index(MyJobsIndexRequest $request): JsonResponse
    {
        $user = $request->user();

        $q = Job::query()
            ->whereHas('assignment', fn ($a) => $a->where('inspector_id', $user->id))
            ->with(['assignment.inspector'])
            ->latest('id');

        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }

        if ($request->filled('from')) {
            $q->whereHas('assignment', fn ($a) => $a->whereDate('scheduled_at_utc', '>=', $request->date('from')));
        }
        if ($request->filled('to')) {
            $q->whereHas('assignment', fn ($a) => $a->whereDate('scheduled_at_utc', '<=', $request->date('to')));
        }

        $page = $q->paginate(15);

        return response()->json([
            'data' => JobResource::collection($page->items()),
            'meta' => [
                'page'     => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total'    => $page->total(),
            ],
        ]);
    }
}
