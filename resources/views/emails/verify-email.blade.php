@extends('emails.layout')
@section('title', 'verify your e-mail')
@section('header', 'welcome to ' . config('app.name'))
@section('content')
<p>Hello, {{ $username }}. Thank you for registering. Please verify your e-mail address to start contributing to our archive and community:</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $verificationUrl }}" class="button">verify</a>
</td>
@endsection
@section('footer')
<p>If you did not register this account, please click <a href="{{ $cancelRegistrationUrl }}">here.</a></p>
@endsection