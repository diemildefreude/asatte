<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'is_group'];
    protected $appends = ['other_users', 'first_unread'];//, 'latest_message_at'];

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
    public function getFirstUnreadAttribute()
    {
        $userId = auth()->id();
            
        if (!$userId) return null;

        // We look for the current user in the 'users' collection.
        // This works perfectly with eager loading (with('users')).
        $currentUser = $this->users->where('id', $userId)->first();

        if (!$currentUser || !$currentUser->pivot) 
        {
            return null;
        }

        $lastReadAt = $currentUser->pivot->last_read_at;

        if ($this->relationLoaded('messages')) 
        {
            if ($this->messages->isEmpty()) {
                return null;
            }

            if (is_null($lastReadAt)) 
            {
                return $this->messages->first()->id;
            }

            $lastReadAtCarbon = \Carbon\Carbon::parse($lastReadAt);

            $firstUnread = $this->messages->first(function ($message) use ($lastReadAtCarbon) 
            {
                return \Carbon\Carbon::parse($message->created_at)->gt($lastReadAtCarbon);
            });

            return $firstUnread?->id;
        }

        // Grab the timestamp of the latest message.
        // We check our pre-calculated database select variable first (from our optimized controller subquery),
        // and fall back to the relation if this model was loaded somewhere else without it.
        $latestMessageTime = $this->latest_message_created_at ?? $this->latestMessage?->created_at;

        // If there are absolutely no messages in the conversation yet, it cannot be unread.
        if (is_null($latestMessageTime)) 
        {
            return null;
        }

        // If the user has never opened this conversation room, it is automatically unread
        if (is_null($lastReadAt)) 
        {
            return $this->messages()->oldest()->value('id');
        }

        // Cast both timestamps to Carbon instances if they aren't already, ensuring a safe comparison
        $latestMessageTime = \Carbon\Carbon::parse($latestMessageTime);
        $lastReadAtCarbon = \Carbon\Carbon::parse($lastReadAt);

        // Is the latest message newer than the user's last read timestamp?
        if (!$latestMessageTime->gt($lastReadAtCarbon)) 
        {
            return null;
        }

        return $this->messages()
            ->where('created_at', '>', $lastReadAt)
            ->oldest()
            ->value('id');
    }
}
