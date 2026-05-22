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
            Log::info("Gotcha, bitch!");
            return response()->json([
                "status" => "mail_sent",
                "message" => 'Your message has been received. Thank you.'
            ], 200);
        }

        //sender, email, subject, website, content
        Log::info("contact req", $request->all());
        $fields = $request->validate
        ([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'subject' => ['string', 'max:255'],
            'content' => ['string'] 
        ]);
        $senderName = $fields['name'];
        $senderEmail = $fields['email'];
        $subject = $fields['subject'];
        $content = $fields['content'];
        Mail::to('s.elliot.perez@gmail.com')->send(new ContactMail($senderName,$senderEmail,$subject,$content));

        return response()->json([
            "status" => "mail_sent",
            "message" => 'Your message has been received. Thank you.'
        ], 200);
    }
}