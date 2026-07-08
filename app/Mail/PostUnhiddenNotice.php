<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Post;

class PostUnhiddenNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $postTitle;
    public $linkToUnhiddenPost;

    /**
     * Create a new message instance.
     */
    public function __construct($postTitle, $username, $postUrl)
    {
        $this->postTitle = $postTitle;
        $this->linkToUnhiddenPost = url("/$username/$postUrl");
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name') . ": Post restored",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.post-unhidden',
            with: [
                'postTitle' => $this->postTitle,
                'linkToUnhiddenPost' => $this->linkToUnhiddenPost,
            ],
        );
    }
}
