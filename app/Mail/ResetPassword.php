<?php

namespace App\Mail;

use App\Enums\LoginType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPassword extends Mailable
{
    use Queueable, SerializesModels;
    public $resetUrl;
    public $username;
    public $loginType;

    /**
     * Create a new message instance.
     */
    public function __construct(string $resetUrl, string $username, LoginType $loginType = LoginType::Email)
    {
        $this->resetUrl = $resetUrl;
        $this->username = $username;
        $this->loginType = $loginType;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $appName = config('app.name');
        return new Envelope(
            subject: "$appName: Password reset request",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
