<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostView extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable =
    [
        'user_id',
        'post_id',
        'ip_address',
        'viewed_at'
    ];
    
    protected function ipAddress(): Attribute
    {
        return Attribute::make(
            // Accessor: When reading from the database (binary -> string)
            get: fn (string $value) => inet_ntop($value),

            // Mutator: When writing to the database (string -> binary)
            set: fn (string $value) => inet_pton($value),
        );
    }
}

