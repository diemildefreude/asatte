@extends('emails.layout')
@section('title', 'new reply on ' . config('app.name'))
@section('header', 'new reply')
@section('content')
<h2 style="font-size: 20px; font-weight: 300; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">
    Hello, {{ $recipientName }}. {{ $replierName }} replied to your comment on <em>{{ $postOrProfileTitle }}</em> on {{ config('app.name') }}.
</h2>
@endsection
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $commentUrl }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto;">view reply</a>
</div>
@endsection
@section('footer')
<p style="font-size: 14px; font-weight: 100; line-height: 22px; color: {{ $footnoteColor }}; margin: 12px 0; text-align: center;">To unsubscribe from notification emails, adjust your preferences on your <a href="{{ route('dashboard') }}" style="color: {{ $buttonTextColor }}; text-decoration: underline;">dashboard</a>.</p>
@endsection
