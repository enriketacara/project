<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Job extends Model
{
    protected $fillable = ['title', 'description', 'status'];

    public function assignment(): HasOne
    {
        return $this->hasOne(JobAssignment::class);
    }
}
