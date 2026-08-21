<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewMessageNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $senderName;
    public $username;
    public $linkToInbox;

    /**
     * Create a new message instance.
     */
    public function __construct($senderName, $username = null)
    {
        $this->senderName = $senderName;
        $this->username = $username;
        $this->linkToInbox = url('/dashboard/mail');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name') . ": New message",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-message',
            with: [
                'senderName' => $this->senderName,
                'username' => $this->username,
                'linkToInbox' => $this->linkToInbox,
            ],
        );
    }
}
