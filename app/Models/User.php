<?php

namespace App\Models;

use App\Enums\LoginType;
use App\Enums\MemberType;
use App\Mail\VerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotificationBase; // <--- Import base notification
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;

class User extends Authenticatable implements OAuthenticatable, MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->where('is_read', false);
    }

    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_user');
    }
    public function hasVerifiedEmail()
    {
        return $this->email_verified_at !== null;
    }
    public function sendEmailVerificationNotification()
    {   //int cast needed to stop a bug with custom verification
        $verificationExpireMinutes = (int) config('auth.verification.expire', 60);

        $customVerificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes($verificationExpireMinutes),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );

        $cancelRegistrationUrl = URL::temporarySignedRoute(
            'registration.cancel',
            now()->addMinutes($verificationExpireMinutes),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );

        Mail::to($this->email)->send(new VerifyEmail(
            $customVerificationUrl,
            $cancelRegistrationUrl,
            $this->username // Pass username directly from the model instance
        ));
    }
    public function sendPasswordResetNotification($token) // Laravel expects this method name
    {

        $loginType = $this->login_type ?? LoginType::Email;
        $this->notify(new ResetPasswordNotification($token, $loginType));
    }
    public function followers()
    {
        return $this->belongsToMany(
            User::class,
            'follows', 
            'followed_id', 
            'follower_id'
        )->withPivot('created_at')
        ->orderByDesc('follows.created_at');
    }
    public function following()
    {
        return $this->belongsToMany(
            User::class,
            'follows', 
            'follower_id', 
            'followed_id'
        )->withPivot('created_at')
        ->orderByDesc('follows.created_at');
    }
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class)
                    ->withPivot("last_read_at")
                    ->withTimestamps();
    }
    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'birthdate',
        'avatar',
        'bio',
        'bio_image_urls',
        'show_email_in_profile',
        'theme',
        'accepted_terms_version'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = 
    [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birthdate' => 'date:Y-m-d',
            'websites' => 'array',
            // 'bio' => 'array',
            'bio_image_urls' => 'array',
            'member_type' => MemberType::class,
            'login_type' => LoginType::class
        ];
    }
    protected $appends = ['is_email_verified'];

    /**
     * Get the user's email verification status.
     *
     * @return bool
     */
    public function getIsEmailVerifiedAttribute(): bool
    {
        return $this->hasVerifiedEmail();
    }
}
