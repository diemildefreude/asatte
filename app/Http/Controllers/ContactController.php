<?php

namespace App\Http\Controllers;

use App\Mail\ContactMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function sendContactMail(Request $request)
    {
        $website = $request['website'];
        if(isset($website)) //Honeypot!
        {


            return redirect()->back()->with('success', 'Your message has been received. Thank you.');
        }

        //sender, email, subject, website, content

        $fields = $request->validate
        ([
            'name' => ['required', 'string', 'max:255', 'regex:/^[^<>]*$/'],
            'email' => ['required', 'email'],
            'subject' => ['string', 'max:255', 'regex:/^[^<>]*$/'],
            'content' => ['string'] 
        ]);
        $senderName = $fields['name'];
        $senderEmail = $fields['email'];
        $subject = $fields['subject'];
        $content = $fields['content'];
        Mail::to(config('mail.contact_address'))->send(new ContactMail($senderName,$senderEmail,$subject,$content));



        return redirect()->back()->with('success', 'Your message has been received. Thank you.');
    }
}