<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', config('app.name'))</title>
    <style>
        /* Fallbacks & hover states for supporting email clients */
        html, body { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            min-height: 100%; 
            background-color: #330055; 
            background: linear-gradient(45deg, #0000ff 0%, #330055 60%); 
            font-weight: 1;
        }
        a { text-decoration: underline; color: {{ $buttonTextColor }}; }
        .button 
        {
            color: {{ $buttonTextColor }};
            border-color: {{ $buttonTextColor }};
        }
        .button:hover 
        {
            background-color: {{ $buttonHoverFallbackColor }} !important;
            background: linear-gradient(45deg, {{ $buttonHoverFallbackColor }} 0%, {{ $buttonTextColor }} 60%) !important;
            color: {{ $buttonHoverTextColor }} !important;
            border-color: {{ $buttonHoverTextColor }} !important;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; min-height: 100%; background-color: #330055; background: linear-gradient(45deg, #330055 0%, #330055 20%, #FFA500 100%); font-family: {{ $fontFamily }}; color: {{ $mainTextColor }};">
    <!-- Outer table for full width background and centering -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" style="width: 100%; min-width: 100%; height: 100%; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: transparent;">
        <tr>
            <td align="center" style="padding: 0; background: transparent; vertical-align: top;">
                <!-- Inner table for content alignment and max-width -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 600px; border-collapse: collapse; margin: 0 auto; text-align: center;">
                    <tr>
                        <td align="center" style="padding: 0 16px; vertical-align: top;">
                            <div style="padding: 24px 0 12px; margin: 0 auto;">
                                <img src="{{ isset($message) ? $message->embed(public_path('images/logo/email_purple_blue_no_inner_outline.png')) : asset('images/logo/email_purple_blue_no_inner_outline.png') }}" alt="Asatte Logo" style="width: 220px; max-width: 100%; height: auto; display: block; margin: 0 auto; border: 0;">
                            </div>
                            <h1 style="font-size: 28px; line-height: 36px; text-align: center; font-weight: 300; color: {{ $mainTextColor }}; margin: 16px 0 12px; font-family: {{ $fontFamily }};">
                                @yield('header')
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0 16px; vertical-align: top;">
                            @yield('content')
                        </td>
                    </tr>
                    @hasSection('button')
                    <tr>
                        <td align="center" style="padding: 0 16px; vertical-align: top;">
                            @yield('button')
                        </td>
                    </tr>
                    @endif
                    @hasSection('footer')
                    <tr>
                        <td align="center" style="padding: 0 16px; vertical-align: top;">
                            <div style="text-align: center; margin: 16px 0;">
                                @yield('footer')
                            </div>
                        </td>
                    </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
