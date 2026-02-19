<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobAssignment extends Model
{
    protected $fillable = [
        'job_id',
        'inspector_id',
        'scheduled_at_utc',
        'completed_at_utc',
        'assessment_rating',
        'assessment_notes',
    ];

    protected $casts = [
        'scheduled_at_utc'  => 'datetime',
        'completed_at_utc'  => 'datetime',
        'assessment_rating' => 'integer',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }
}
