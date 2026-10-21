<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewFollowerNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $followerName;
    public $recipientName;
    public $profileUrl;

    /**
     * Create a new message instance.
     */
    public function __construct($followerName, $recipientName, $profileUrl)
    {
        $this->followerName = $followerName;
        $this->recipientName = $recipientName;
        $this->profileUrl = $profileUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New follower",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-follower',
            with: [
                'followerName' => $this->followerName,
                'recipientName' => $this->recipientName,
                'profileUrl' => $this->profileUrl,
            ],
        );
    }
}
