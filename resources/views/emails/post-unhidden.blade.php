@extends('emails.layout')
@section('title', config('app.name') . ": Post restored.")
@section('header', "Post restored.")
@section('content')
<p>Hello. Your post, <em>{{ $postTitle }}</em>, has been restored by an administrator.</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $linkToUnhiddenPost }}" class="button">go to dashboard</a>
</td>
@endsection
