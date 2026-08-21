@extends('emails.layout')
@section('title', config('app.name') . ' News: ' . $newsPostTitle)
@section('header', config('app.name') . ' News: ' . $newsPostTitle)
@section('content')
<div style="padding: 16px 0; text-align: left;">
    <div style="border: 1px solid {{ $mainTextColor }}; padding: 20px; margin: 16px 0; font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; text-align: left; background-color: rgba(255, 255, 255, 0.1);">
        <em>{!! nl2br(e($previewOfNewsPostStatement)) !!}...</em>
    </div>
</div>
@endsection
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $linkToNewsPost }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto;">read full article</a>
</div>
@endsection
@section('footer')
<p style="font-size: 14px; font-weight: 100; line-height: 22px; color: {{ $footnoteColor }}; margin: 12px 0; text-align: center;">To unsubscribe from news &amp; DM notices, untick the 'accept e-mail notifications' box on your <a href="{{ route('dashboard') }}" style="color: {{ $buttonTextColor }}; text-decoration: underline;">dashboard</a>.</p>
@endsection
