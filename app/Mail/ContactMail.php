<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    //public array $details;
    public $senderName;
    public $senderEmail;
    public $rawSubject;
    public $content;
    public function __construct(string $senderName, string $senderEmail, string $subject, string $content)
    {
        $this->senderName = $senderName;
        $this->senderEmail = $senderEmail;
        $this->rawSubject = $subject;
        $this->content = $content;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $appName = config('app.name');
        return new Envelope(
            subject: "$appName contact form: $this->rawSubject",
            replyTo: [
            new Address($this->senderEmail, $this->senderName),
        ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-email'
        );
    }
}
