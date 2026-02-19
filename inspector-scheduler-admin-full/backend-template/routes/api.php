<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\JobController;
use App\Http\Controllers\Api\V1\MyJobsController;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
    });

    Route::middleware('auth:sanctum')->get('/me', [MeController::class, 'show']);

    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/{job}', [JobController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/jobs/{job}/claim', [JobController::class, 'claim']);
        Route::patch('/jobs/{job}/schedule', [JobController::class, 'schedule']);
        Route::post('/jobs/{job}/complete', [JobController::class, 'complete']);

        Route::get('/my/jobs', [MyJobsController::class, 'index']);
    });
});

use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminInspectorController;
use App\Http\Controllers\Api\V1\Admin\AdminInspectorJobsController;
use App\Http\Controllers\Api\V1\Admin\AdminJobController;

Route::prefix('v1/admin')->middleware(['auth:sanctum','role:ADMIN'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'show']);

    Route::get('/inspectors', [AdminInspectorController::class, 'index']);
    Route::post('/inspectors', [AdminInspectorController::class, 'store']);
    Route::get('/inspectors/{inspector}', [AdminInspectorController::class, 'show']);
    Route::patch('/inspectors/{inspector}', [AdminInspectorController::class, 'update']);
    Route::delete('/inspectors/{inspector}', [AdminInspectorController::class, 'destroy']);

    Route::get('/inspectors/{inspector}/jobs', [AdminInspectorJobsController::class, 'index']);

    Route::get('/jobs', [AdminJobController::class, 'index']);
    Route::post('/jobs', [AdminJobController::class, 'store']);
    Route::get('/jobs/{job}', [AdminJobController::class, 'show']);
    Route::patch('/jobs/{job}', [AdminJobController::class, 'update']);
    Route::delete('/jobs/{job}', [AdminJobController::class, 'destroy']);
});
