<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileComment extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'content',
        'profile_id',
        'parent_id'
    ];

    protected $appends = ['content_html'];

    public function getContentHtmlAttribute()
    {
        // Escape the original text, then convert newlines to <br>
        return nl2br(e($this->content));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function profile()
    {
        return $this->belongsTo(User::class, 'profile_id');
    }

    protected static function booted()
    {
        static::deleting(function ($comment) {
            \App\Models\Notification::where('data->profile_comment_id', $comment->id)->delete();
        });
    }
}
