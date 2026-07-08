@extends('emails.layout')
@section('title', config('app.name') . ": Post hidden by admin.")
@section('header', "Post hidden by admin.")
@section('content')
<p>Hello. Your post, <em>{{ $postTitle }}</em>, has been hidden.</p>
@if($reasonGivenByAdmin)
<p>reason: {!! nl2br(e($reasonGivenByAdmin)) !!}</p>
@endif
<p>If you wish to dispute this decision, please reply to the message in your inbox.</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $linkToMailInbox }}" class="button">go to inbox</a>
</td>
@endsection