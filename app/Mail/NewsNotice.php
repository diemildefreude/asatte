<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsNotice extends Mailable
{
    use Queueable, SerializesModels;

    public $newsPostTitle;
    public $previewOfNewsPostStatement;
    public $linkToNewsPost;

    /**
     * Create a new message instance.
     */
    public function __construct($newsPostTitle, $previewOfNewsPostStatement, $linkToNewsPost)
    {
        $this->newsPostTitle = $newsPostTitle;
        $this->previewOfNewsPostStatement = $previewOfNewsPostStatement;
        $this->linkToNewsPost = $linkToNewsPost;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name') . ' News: ' . $this->newsPostTitle,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.news-notice',
            with: [
                'newsPostTitle' => $this->newsPostTitle,
                'previewOfNewsPostStatement' => $this->previewOfNewsPostStatement,
                'linkToNewsPost' => $this->linkToNewsPost,
            ],
        );
    }
}
