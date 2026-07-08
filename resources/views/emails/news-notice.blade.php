@extends('emails.layout')
@section('title', config('app.name') . ' News: ' . $newsPostTitle)
@section('header', config('app.name') . ' News: ' . $newsPostTitle)
@section('content')
<p style="font-size: 1rem; line-height: 1.5rem; text-align: left; background-color: rgba(0,0,0,0.2); padding: 1rem;">
    <em>{!! nl2br(e($previewOfNewsPostStatement)) !!}...</em>
</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $linkToNewsPost }}" class="button">read full article</a>
</td>
@endsection
@section('footer')
<p>To unsubscribe from news & DM notices, untick the 'accept e-mail notifications' box on your <a href="{{ route('dashboard') }}">dashboard</a>.</p>
@endsection
