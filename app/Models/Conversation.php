<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'is_group'];
    protected $appends = ['other_users', 'is_unread'];//, 'latest_message_at'];

    public function users()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('last_read_at')
                    ->withTimestamps();
    }
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
    public function getLatestMessageAtAttribute()
    {
        // If you've eager-loaded latestMessage, this won't trigger a new query
        return $this->latestMessage ? $this->latestMessage->created_at : $this->created_at;
    }
    public function getOtherUsersAttribute()
    {
        // Check if the relation is already loaded to avoid a crash
        if (!$this->relationLoaded('users')) 
        {
            return collect(); 
        }
        return $this->users
            ->where('id', '!=', auth()->id())
            ->map(function($user) 
            {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                ];
            })->values();
            //->get(['users.id', 'users.username', 'users.avatar']);
    }
    public function getIsUnreadAttribute()
    {
        $userId = auth()->id();
            
        if (!$userId) return false;

        // We look for the current user in the 'users' collection.
        // This works perfectly with eager loading (with('users')).
        $currentUser = $this->users->where('id', $userId)->first();

        if (!$currentUser || !$currentUser->pivot) {
            return false;
        }

        $lastReadAt = $currentUser->pivot->last_read_at;

        // If never read, it's unread if the conversation exists (has an updated_at)
        if (is_null($lastReadAt)) {
            return !is_null($this->updated_at);
        }

        // Is the conversation's last activity newer than the user's last read?
        return $this->updated_at->gt($lastReadAt);
    }
    // public function otherUsers($currentUserId)
    // {
    //     return $this->users()->where('user_id', '!=', $currentUserId);
    // }
    // public function otherUser($currentUserId)
    // {
    //     return $this->otherUsers($currentUserId)->first();
    // }
}
