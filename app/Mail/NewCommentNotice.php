<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewCommentNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $commenterName;
    public $recipientName;
    public $postOrProfileTitle;
    public $contextType; // 'post' or 'profile'
    public $commentUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($commenterName, $recipientName, $postOrProfileTitle, $contextType, $commentUrl)
    {
        $this->commenterName = $commenterName;
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
            subject: "New comment",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-comment',
            with: [
                'commenterName' => $this->commenterName,
                'recipientName' => $this->recipientName,
                'postOrProfileTitle' => $this->postOrProfileTitle,
                'contextType' => $this->contextType,
                'commentUrl' => $this->commentUrl,
            ],
        );
    }
}
