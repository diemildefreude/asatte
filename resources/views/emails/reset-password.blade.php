@extends('emails.layout')
@section('title', 'account recovery for ' . config('app.name'))
@section('header', 'account recovery for ' . config('app.name'))
@section('content')
@if($loginType === \App\Enums\LoginType::Email || empty($loginType))
    <p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">Hello, {{ $username }}. We received an account recovery request for this account. Please click below to set a new password for your account:</p>
@else
    <p style="font-size: 18px; font-weight: 100; line-height: 28px; color: {{ $mainTextColor }}; margin: 16px 0; text-align: center;">We've received a request to reset the password for your account. However, your account was created using {{ $loginType->value ?? $loginType }} sign-in. To access your account, simply head back to the login screen and click the {{ $loginType->value ?? $loginType }} login button.</p>
@endif
@endsection

@if($loginType === \App\Enums\LoginType::Email || empty($loginType))
@section('button')
<div style="text-align: center; padding: 20px 0;">
    <a href="{{ $resetUrl }}" class="button" style="color: {{ $buttonTextColor }}; display: inline-block; background: transparent; text-decoration: none; border: 1px solid {{ $buttonTextColor }}; font-size: 18px; padding: 14px 28px; text-align: center; margin: 0 auto;">reset password</a>
</div>
@endsection
@endif

@section('footer')
<p style="font-size: 14px; font-weight: 100; line-height: 22px; color: {{ $footnoteColor }}; margin: 12px 0; text-align: center;">If you did not make this request, no action is needed.</p>
@endsection