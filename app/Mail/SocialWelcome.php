<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SocialWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public $username;
    public $loginType;
    public $linkToHomePage;

    /**
     * Create a new message instance.
     */
    public function __construct($username, $loginType)
    {
        $this->username = $username;
        $this->loginType = $loginType;
        $this->linkToHomePage = url('/');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to ' . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.social-welcome',
            with: [
                'username' => $this->username,
                'loginType' => $this->loginType,
                'linkToHomePage' => $this->linkToHomePage,
            ],
        );
    }
}
