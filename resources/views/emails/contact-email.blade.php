@extends('emails.layout')
@section('title', config('app.name') . ': contact form message')
@section('header', 'message from ' . $senderName . ' via the contact form')
@section('content')
<h2 style="font-size: 20px; font-weight: 300; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0 0; text-align: center;">subject: {{$rawSubject}}</h2>
@endsection
@section('button')
<div style="padding: 16px 0; text-align: left;">
    <div style="border: 1px solid {{ $mainTextColor }}; padding: 20px; margin: 16px 0; font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; text-align: left; background-color: rgba(255, 255, 255, 0.1);">
        {!! nl2br($content) !!}
    </div>
</div>
@endsection