<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NeighborsPage extends Model
{
    use HasFactory;

    protected $table = 'neighbors_pages';

    protected $fillable =
    [
        'statement'
    ];

    protected $casts =
    [
        'statement_image_urls' => 'array'
    ];
}
