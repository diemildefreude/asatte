@extends('emails.layout')
@section('title', config('app.name') . ": Post restored.")
@section('header', "Post restored.")
@section('content')
<p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">Hello, {{ $username }}. Your post, <em>{{ $postTitle }}</em>, has been restored by an administrator.</p>
@endsection
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $linkToUnhiddenPost }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto 24px;">go to dashboard</a>
</div>
@endsection
