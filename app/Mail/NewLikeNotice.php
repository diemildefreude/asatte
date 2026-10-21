<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewLikeNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $likerName;
    public $recipientName;
    public $postTitle;
    public $postUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($likerName, $recipientName, $postTitle, $postUrl)
    {
        $this->likerName = $likerName;
        $this->recipientName = $recipientName;
        $this->postTitle = $postTitle;
        $this->postUrl = $postUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Post liked",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-like',
            with: [
                'likerName' => $this->likerName,
                'recipientName' => $this->recipientName,
                'postTitle' => $this->postTitle,
                'postUrl' => $this->postUrl,
            ],
        );
    }
}
