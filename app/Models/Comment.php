<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;
    protected $fillable =
    [
        'content',
        'post_id',
        'parent_id'
    ];
    protected $appends = ['content_html'];
    protected $casts = 
    [
    ];
    public function getContentHtmlAttribute()
    {
        // Escape the original text, then convert newlines to <br>
        return nl2br(e($this->content));
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    protected static function booted()
    {
        static::deleting(function ($comment) {
            \App\Models\Notification::where('data->comment_id', $comment->id)->delete();
        });
    }
        
    // --- Removed the redundant getUsernameAttribute() and getAvatarAttribute() ---
}
