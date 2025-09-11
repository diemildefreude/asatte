<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected $fillable =
    [
        'user_id',
        'post_url',
        'title',
        'subtitle',
        'website',
        'main_video',
        'is_private',
        'gallery_image_urls',
        'gallery_alts',
        'statement',
        'statement_image_urls'
    ];

    protected $casts = 
    [
        'gallery_image_urls' => 'array',
        'gallery_alts' => 'array',
        'statement' => 'array',
        'statement_image_urls' => 'array',
    ];
}

