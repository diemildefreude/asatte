@extends('emails.layout')
@section('title', 'Welcome to ' . config('app.name'))
@section('header', 'Welcome to ' . config('app.name'))
@section('content')
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">The premiere community hub for Internet Art.</p> 
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">You have registered using {{ $loginType }}, so no further action is required - You can begin updating your profile, commenting, and posting Internet Art right away.</p>
@endsection
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $linkToHomePage }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto 24px;">get started</a>
</div>
@endsection
