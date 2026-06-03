<?php

namespace App\Notifications;

use App\Enums\LoginType;
use Illuminate\Auth\Notifications\ResetPassword as BaseResetPasswordNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage; // Keep this import if you ever use MailMessage directly
use Illuminate\Support\Facades\URL; // <--- Add this import
use App\Mail\ResetPassword as CustomResetPasswordMailable; // <--- Import your custom Mailable
use Illuminate\Support\Facades\Log;

class ResetPasswordNotification extends BaseResetPasswordNotification implements ShouldQueue
{
    use Queueable;

    public LoginType $loginType;

    /**
     * Create a new notification instance.
     *
     * @param string $token The password reset token.
     * @param LoginType $loginType The login type (e.g. Email, Google, Github).
     */
    public function __construct(string $token, LoginType $loginType = LoginType::Email)
    {
        parent::__construct($token); // Call parent constructor to set $this->token
        $this->loginType = $loginType;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @return \Illuminate\Mail\Mailable // <--- THIS IS THE CORRECT RETURN TYPE HINT
     */
    public function toMail($notifiable) // No need for specific type hint for $notifiable if it's 'object'
    {
        $reactAppUrl = config('app.url', 'http://localhost:3000');
        $resetUrl = $reactAppUrl . '/password-reset?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        $userName = $notifiable->username;
        Log::info("'to' address is " . $notifiable->email);
        // Return your custom Mailable instance
        return (new CustomResetPasswordMailable($resetUrl, $userName, $this->loginType))
            ->to($notifiable->email); // Explicitly set the recipient
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}