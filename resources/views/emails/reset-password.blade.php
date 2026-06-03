<!DOCTYPE html>
<html lang="en">
<head>
    <title>verify your e-mail</title>
    <style>
        /* General styles for the entire email body */
        body, html {
            margin: 0;
            padding: 0;
            /* Provide a solid background color fallback */
            background-color: #330055; /* A dark color from your gradient */
            font-family: Tahoma, sans-serif;
            color: white;
        }
        /* The main container table for the email */
        .full-width-table {
            width: 100%;
            border-collapse: collapse;
            mso-table-lspace: 0pt; /* Outlook specific */
            mso-table-rspace: 0pt; /* Outlook specific */
            /* Apply the background color here as a fallback */
            background-color: #330055;
        }
        .gradient-cell {
            /* This is where you'd try to apply the gradient, but it's not widely supported */
            /* For clients that support it, you can put it here */
            background: linear-gradient(45deg, #0000ff 0%, #330055 60%);
            /* Fallback for clients that don't support gradients */
            background-color: #330055;
        }
        h1, p, a, td { /* <--- Apply to common text containers and cells */
            color: #FFFFFF !important; /* Force white color, !important for inlining */
        }
        /* Styles for the message-container, using table-based layout */
        .message-container-table 
        {
            width: 100%;
            max-width: 700px; /* Match your main-text-button-container max-width */
            border-collapse: collapse;
            margin: 2rem auto; /* Center the table */
            padding: 20px; /* Add some padding around content */
            text-align: center; /* Center text/inline elements within */
        }
        .message-container-table td 
        {
            padding: 20px; /* Cell padding */
            vertical-align: top; /* Align content to top of cell */
        }
        h1 
        {
            font-size: 2.5rem;
            text-align: center;
            font-weight: 1;
            color: #FFFFFF !important; /* <--- Explicitly set for h1 */
        }
        .message-container-table p
        {
            line-height: 2.5rem;
            font-size: 1.5rem;
            font-weight: 1;
            color: #FFFFFF !important;
            margin: 0;
        }
        /* For the button, make sure its parent has text-align: center */
        .button-cell 
        {
            text-align: center; /* Center the button horizontally */
            padding-top: 20px; /* Space above button */
            padding-bottom: 20px; /* Space below button */
        }
        .button {
            background: transparent;
            text-decoration: none;
            color: #FFFFFF !important;
            border: 4px solid white;
            cursor: pointer;
            font-size: 1.5rem;
            padding: 1.5rem 2rem; /* Adjusted padding for better button appearance */
            display: inline-block; /* Use inline-block for buttons in email, then center parent text */
            margin: 0 auto; /* Will work if parent is block and has text-align: center */
            width: fit-content; /* Helps with centering */
            text-align: center; /* Ensure text inside button is centered */
        }
        .button:hover 
        {
            background: linear-gradient(45deg, #88CDFFCC 0%, #1177c0cc 60%);
            background: -webkit-linear-gradient(45deg, #88CDFFCC 0%, #1177c0cc 60%);
            color: #F9FBD2 !important;
            border: 4px solid #F9FBD2;
        }
        .not-me-container {
            text-align: center; /* Center the text in this div */
        }
        .message-container-table .not-me-container p
        {            
            font-size: 1rem;
        }
    </style>
</head>
<body>
    <!-- Outer table for full width background and centering -->
    <table class="full-width-table" role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td class="gradient-cell">
                <!-- Inner table for content alignment and max-width -->
                <table class="message-container-table" role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding-top: 40px;">
                            <h1>account recovery for netart.io</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 20px;">
                            @if($loginType === \App\Enums\LoginType::Email || empty($loginType))
                                <p>Hello, {{ $username }}. We received an account recovery request for this account. Please click below to set a new password for your account:</p>
                            @else
                                <p>We've received a request to reset the password for your account. However, your account was created using {{ $loginType->value }} sign-in. To access your account, simply head back to the login screen and click the {{ $loginType }} login button.</p>
                            @endif
                        </td>
                    </tr>
                    @if($loginType === \App\Enums\LoginType::Email || empty($loginType))
                    <tr>
                        <td class="button-cell">
                            <a href="{{ $resetUrl }}" class="button">reset password</a>
                        </td>
                    </tr>
                    @endif
                    <tr>
                        <td>
                            <div class="not-me-container">
                                <p>If you did not make this request, no action is needed.</a></p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>