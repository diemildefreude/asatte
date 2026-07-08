@extends('emails.layout')
@section('title', 'new message on ' . config('app.name'))
@section('header', 'new message')
@section('content')
<p>Hello. You have received a new message from {{ $senderName }} on {{ config('app.name') }}.</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $linkToInbox }}" class="button">view message</a>
</td>
@endsection
@section('footer')
<p>To unsubscribe from news & DM notices, untick the 'accept e-mail notifications' box on your <a href="{{ route('dashboard') }}">dashboard</a>.</p>
@endsection
