@extends('emails.layout')
@section('title', config('app.name') . ": Post hidden by admin.")
@section('header', "Post hidden by admin.")
@section('content')
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">Hello, {{ $username }}. Your post, <em>{{ $postTitle }}</em>, has been hidden.</p>
@if($reasonGivenByAdmin)
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">reason: {!! nl2br(e($reasonGivenByAdmin)) !!}</p>
@endif
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">If you wish to dispute this decision, please reply to the message in your inbox.</p>
@endsection
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $linkToMailInbox }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto 24px;">go to inbox</a>
</div>
@endsection