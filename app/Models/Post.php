<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    use HasFactory;
    protected $fillable =
    [
        'user_id',
        'post_url',
        'title',
        'subtitle',
        'website',
        'source_code',
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
    protected $appends = ['have_liked', 'users_who_liked_count'];

    public function getHaveLikedAttribute()
    {
        // Check if the property was set by the query (withExists)
        // If not set, return false by default.
        return $this->attributes['have_liked'] ?? false;
    }

    /**
     * Define the accessor for 'users_who_liked_count'.
     * Provides a default value if not loaded via withCount.
     */
    public function getUsersWhoLikedCountAttribute()
    {
        // Check if the property was set by the query (withCount)
        // If not set, return 0 by default.
        return $this->attributes['users_who_liked_count'] ?? 0;
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function usersWhoLiked(): BelongsToMany
    {
        // If your pivot table is named 'post_user', this is sufficient:
        return $this->belongsToMany(User::class, 'post_user')->withTimestamps();
        
        // If you named the table 'post_likes', you must specify it:
        // return $this->belongsToMany(User::class, 'post_likes');
    }

    public function comments()
    {
        // One Post has many Comments
        return $this->hasMany(Comment::class);
    }
}

