<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class About extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'statement'
    ];

    protected $casts =
    [
        'statement' => 'array',
        'statement_image_urls' => 'array'
    ];
}