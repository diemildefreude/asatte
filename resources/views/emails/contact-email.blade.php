<!DOCTYPE html>
<html lang="en">
<head>
    <title>{{config('app.name')}}: contact form message</title>
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
        h1, h2, p, a, td { /* <--- Apply to common text containers and cells */
            color: #FFFFFF !important; /* Force white color, !important for inlining */
        }
        /* Styles for the message-container, using table-based layout */
        .message-container-table 
        {
            width: 100%;
            max-width: 700px; /* Match your main-text-button-container max-width */
            border-collapse: collapse;
            margin: 0 auto; /* Center the table */
            padding: 20px; /* Add some padding around content */
        }
        .message-container-table td 
        {
            /* Cell padding */
            vertical-align: top; /* Align content to top of cell */
        }
        h1, h2
        {
            font-size: 1.1rem;
            text-align: center;
            font-weight: 1;
            color: #FFFFFF !important; /* <--- Explicitly set for h1 */
        }
        h2
        {
            font-size: 1.0rem;
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
        .message-container-table p
        {            
            font-size: 1rem;
        }
        .message-box
        {
            padding: 1rem;
        }
        .message
        {
            border: 1px solid #F9FBD2;
            padding: 0.5rem;
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
                        <td>
                            <h1>message from {{ $senderName }} via the contact form</h1>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2>subject: {{$rawSubject}}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td class="message-box">
                            <div class="message">
                                {!! nl2br($content) !!}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>