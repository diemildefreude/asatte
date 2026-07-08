@extends('emails.layout')
@section('title', 'account recovery for ' . config('app.name'))
@section('header', 'account recovery for ' . config('app.name'))
@section('content')
@if($loginType === \App\Enums\LoginType::Email || empty($loginType))
    <p>Hello, {{ $username }}. We received an account recovery request for this account. Please click below to set a new password for your account:</p>
@else
    <p>We've received a request to reset the password for your account. However, your account was created using {{ $loginType->value ?? $loginType }} sign-in. To access your account, simply head back to the login screen and click the {{ $loginType->value ?? $loginType }} login button.</p>
@endif
@endsection

@if($loginType === \App\Enums\LoginType::Email || empty($loginType))
@section('button')
<td class="button-cell">
    <a href="{{ $resetUrl }}" class="button">reset password</a>
</td>
@endsection
@endif

@section('footer')
<p>If you did not make this request, no action is needed.</p>
@endsection