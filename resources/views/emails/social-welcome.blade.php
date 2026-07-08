@extends('emails.layout')
@section('title', 'welcome to ' . config('app.name'))
@section('header', 'welcome to ' . config('app.name'))
@section('content')
<p>...the premiere community hub for Internet Art. You have registered using {{ $loginType }}, so no further action is required - You can begin updating your profile, commenting, and posting Internet Art right away!</p>
@endsection
@section('button')
<td class="button-cell">
    <a href="{{ $linkToHomePage }}" class="button">get started</a>
</td>
@endsection
