<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewReplyNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $replierName;
    public $recipientName;
    public $postOrProfileTitle;
    public $contextType; // 'post' or 'profile'
    public $commentUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($replierName, $recipientName, $postOrProfileTitle, $contextType, $commentUrl)
    {
        $this->replierName = $replierName;
        $this->recipientName = $recipientName;
        $this->postOrProfileTitle = $postOrProfileTitle;
        $this->contextType = $contextType;
        $this->commentUrl = $commentUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New reply",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-reply',
            with: [
                'replierName' => $this->replierName,
                'recipientName' => $this->recipientName,
                'postOrProfileTitle' => $this->postOrProfileTitle,
                'contextType' => $this->contextType,
                'commentUrl' => $this->commentUrl,
            ],
        );
    }
}
