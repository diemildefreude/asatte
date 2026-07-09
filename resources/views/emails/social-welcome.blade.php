@extends('emails.layout')
@section('title', 'Welcome to ' . config('app.name'))
@section('header', 'Welcome to ' . config('app.name'))
@section('content')
<p>The premiere community hub for Internet Art.</p> 
<p>You have registered using {{ $loginType }}, so no further action is required - You can begin updating your profile, commenting, and posting Internet Art right away.</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $linkToHomePage }}" class="button">get started</a>
</td>
@endsection
