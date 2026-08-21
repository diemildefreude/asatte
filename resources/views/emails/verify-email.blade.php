@extends('emails.layout')
@section('title', 'verify your e-mail')
@section('header', 'welcome to ' . config('app.name'))
@section('content')
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">Hello, {{ $username }}. Thank you for registering. Please verify your e-mail address to start contributing to our archive and community:</p>
@endsection
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $verificationUrl }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto;">verify</a>
</div>
@endsection
@section('footer')
<p style="font-size: 14px; font-weight: 100; line-height: 22px; color: {{ $footnoteColor }}; margin: 12px 0; text-align: center;">If you did not register this account, please click <a href="{{ $cancelRegistrationUrl }}" style="color: {{ $buttonTextColor }}; text-decoration: underline;">here.</a></p>
@endsection