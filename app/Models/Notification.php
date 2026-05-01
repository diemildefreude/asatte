<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;
    public $timestamps = false;
    public $unhidden_at;
    protected $fillable =
    [
        'user_id',
        'type',
        'data',
    ];

    protected $appends = ['unhidden_at'];

    protected $casts = 
    [
        'data' => 'array',
        'is_read' => 'boolean',
        'type' => NotificationType::class
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function getUnhiddenAtAttribute()
    {
        return $this->unhidden_at;
    }
}

