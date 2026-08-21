<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PostHiddenNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $postTitle;
    public $username;
    public $reasonGivenByAdmin;
    public $linkToMailInbox;

    /**
     * Create a new message instance.
     */
    public function __construct($postTitle, $reasonGivenByAdmin, $username = null)
    {
        $this->postTitle = $postTitle;
        $this->reasonGivenByAdmin = $reasonGivenByAdmin;
        $this->username = $username;
        $this->linkToMailInbox = url('/dashboard/mail');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name') . ": Post hidden",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.post-hidden',
            with: [
                'postTitle' => $this->postTitle,
                'username' => $this->username,
                'reasonGivenByAdmin' => $this->reasonGivenByAdmin,
                'linkToMailInbox' => $this->linkToMailInbox,
            ],
        );
    }
}
