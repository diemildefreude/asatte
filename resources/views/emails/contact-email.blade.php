@extends('emails.layout')
@section('title', config('app.name') . ': contact form message')
@section('header', 'message from ' . $senderName . ' via the contact form')
@section('content')
<h2 style="font-size: 1.0rem; text-align: center; color: #FFFFFF !important;">subject: {{$rawSubject}}</h2>
@endsection
@section('button')
<td class="message-box">
    <div class="message">
        {!! nl2br($content) !!}
    </div>
</td>
@endsection