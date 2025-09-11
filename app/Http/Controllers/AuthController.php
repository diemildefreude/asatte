<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Facades\Password;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 
            [
                'required',
                'string',
                'confirmed', // Requires 'password_confirmation' field
                PasswordRule::min(8) // Use your aliased PasswordRule
                    ->mixedCase()
                    ->numbers()
            ],
        ]);

        $status = Password::broker()->reset(
        $request->only('email', 'password', 'token'),
        function (User $user, string $password) {
            $user->forceFill([ // Use forceFill to directly update password and bypass fillable restrictions
                'password' => Hash::make($password), // Explicitly hash here for clarity, though 'hashed' cast handles it
            ])->save(); // Clear remember token for security
            
            $user->remember_token = null;
            $user->save();
            // Optionally, revoke all other tokens for security (forces re-login on other devices)
            // This is a good practice after a password reset.
            $user->tokens->each(function ($token) 
            {
                $token->revoke();
            });
        });

        if ($status == Password::PASSWORD_RESET) 
        {
            Log::info("Password successfully reset for email: " . $request->email);
            return response()->json([
                'message' => 'Your password has been reset successfully.',
                'status' => 'password_reset_success'
            ], Response::HTTP_OK);
        }

        return response()->json([
            'message' => 'Unable to reset password. Please try again later.',
            'status' => 'password_reset_failed'
        ], Response::HTTP_INTERNAL_SERVER_ERROR); 
    }
    public function changePassword(Request $request)
    {
        Log::info("changePassword method called");
        if(!$request->user()->hasVerifiedEmail())
        {
            Log::error("e-mail not verified");
            return response()->json([
                'message' => 'Your email address must be verified to change your password.', // <--- Top-level message
                'status' => 'change_pass_unverified'
            ], Response::HTTP_FORBIDDEN);
        }
        Log::info("e-mail is verified. Validating...");
        $request->validate
        ([
            'old_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase() 
                    ->numbers()
            ]
        ]);
        Log::info("input validated successfully");

        $user = $request->user();
        if (!Hash::check($request->old_password, $user->password)) 
        {
            Log::error("old password incorrect");
            return response()->json([
                'status' => "old_password_incorrect",
                'message' => 'The provided password does not match your current password.',
            ], Response::HTTP_FORBIDDEN);
        }

        $user->password = $request->new_password;
        $user->save();

        $currentTokenId = $request->user()->token()->id;

        // Revoke all tokens EXCEPT the current one
        $user->tokens->where('id', '!=', $currentTokenId)->each(function ($token) 
        {
            $token->revoke();
        });

        return response() ->json([
            'status' => 'password_changed',
            'message' => 'Your password has been changed successfully.'
        ], 200);

    }
    public function sendRecoveryLink(Request $request)
    {
        $fieldType = filter_var($request->login_field, FILTER_VALIDATE_EMAIL) 
            ? 'email' : 'username';
        $user = User::where($fieldType, $request->login_field)->first();

        if (!$user) 
        {
            Log::info("Password reset attempt for non-existent user: " . $request->login_field);
            return response()->json([
                'message' => 'If an account with that email/username exists, a password reset link has been sent.',
                'status' => 'password_reset_link_sent' // Generic success status
            ], Response::HTTP_OK);
        }

        $status = Password::sendResetLink(
            ['email' => $user->email] // The broker expects an array with 'email'
        );

        if ($status == Password::RESET_LINK_SENT) 
        {
            Log::info("Password reset link sent to: " . $user->email);
            return response()->json([
                'message' => 'If an account with that email/username exists, a password reset link has been sent.',
                'status' => 'password_reset_link_sent' // Consistent success status
            ], Response::HTTP_OK);
        }

        Log::error("Failed to send password reset link to: " . $user->email . " Status: " . $status);
        return response()->json([
            'message' => 'Unable to send password reset link. Please try again later.',
            'status' => 'password_reset_link_failed'
        ], Response::HTTP_INTERNAL_SERVER_ERROR);

    }
    public function sendVerifyLink(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) 
        {
            return response()->json([
                'status' => 'send_link_already_verified'
            ], 200);
        }
        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'status' => 'send_link_sent'
        ], 200); 
    }
    public function verifyEmail (Request $request, string $id, string $hash) 
    {
        $reactAppUrl = config('app.react_app_url', 'http://localhost:3000'); // Define this in config/app.php and .env
        try
        {
            $user = User::findOrFail($id);

            if (! hash_equals((string) $hash, sha1($user->email))) 
            {
                //Log::error('Hash mismatch for user ID: ' . $id);
                //throw new AuthorizationException('Invalid verification link.');
                return redirect($reactAppUrl . '/dashboard?status=invalid_link');
            }
            if ($user->hasVerifiedEmail())
            {
                return redirect($reactAppUrl . '/dashboard?status=verify_already_verified');
            }

            // 4. Mark the email as verified
            $user->markEmailAsVerified(); 
            return redirect($reactAppUrl . '/dashboard?status=verify_verified');
        }
        catch (ModelNotFoundException $e) 
        {
            // User was not found, meaning they likely already cancelled or the link is invalid
            Log::info("Attempt to verify non-existent user ID {$id}. Likely already canceled.");
            return redirect($reactAppUrl . '/dashboard?status=verify_already_canceled'); // New status for frontend
        } 
    }
    public function cancelRegistration(Request $request, int $id, string $hash)
    {        
        $reactAppUrl = config('app.react_app_url', 'http://localhost:3000');
        try
        {
            $user = User::findOrFail($id);

            if (! hash_equals((string) $hash, sha1($user->email))) 
            {
                //throw new AuthorizationException;
                return redirect($reactAppUrl . '/dashboard?status=invalid_link');
            }

            if ($user->hasVerifiedEmail()) 
            {
                return redirect($reactAppUrl . '/dashboard?status=cancel_already_verified');
            }        

            $user->delete(); // Delete the user record
            Log:info("User ID {$user->id} with email {$user->email} cancelled registration.");
            return redirect($reactAppUrl . '/dashboard?status=cancel_canceled');
        }
        catch (ModelNotFoundException $e) 
        {
            // User was not found, meaning they likely already cancelled or the link is invalid
            Log::info("Attempt to cancel non-existent user ID {$id}. Likely already canceled.");
            return redirect($reactAppUrl . '/dashboard?status=cancel_user_not_found'); // New status for frontend
        } 
        catch (AuthorizationException $e) 
        {
            // This catches the invalid hash case
            Log::error("Authorization exception during cancel attempt for user ID {$id}: " . $e->getMessage());
            return redirect($reactAppUrl . '/dashboard?status=invalid_link'); // New status for frontend
        } 
        catch (\Exception $e) 
        {
            // Catch any other unexpected errors
            Log::error("Unexpected error canceling registration for user ID {$id}: " . $e->getMessage());
            return redirect($reactAppUrl . '/dashboard?status=cancel_error');
        }
    }
    public function register(RegisterRequest $request)//e-mail registration
    {
        $formattedBirthdate = Carbon::parse($request->birthdate)->format('Y-m-d');

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Hash the password!
            'birthdate' => $formattedBirthdate,
            'login_type' => $request->login_type,
            'provider_id' => null, // Will be null for email registration
        ]);

        $oauthRequest = Request::create('oauth/token', 'POST', [
            'grant_type' => 'password',
            'client_id' => config('passport.client_id'),
            'client_secret' => config('passport.client_secret'),
            'username' => $user->email, // Passport's password grant typically expects 'username' to be the user's email
            'password' => $request->password, // Use the original (unhashed) password for the token request
            'scope' => '', // Define custom scopes if your application uses them
            'profile_complete' => true
        ]);

        $response = app()->handle($oauthRequest);
        $data = json_decode($response->getContent());

        $user->sendEmailVerificationNotification();
        // 3. Return the user data and the generated token
        return response()->json([
            'user' => $user->toArray(),
            'access_token' => $data->access_token,
            'refresh_token' => $data->refresh_token ?? null,
            'expires_in' => $data->expires_in,
            'token_type' => $data->token_type,
        ], $response->getStatusCode());

        
    }
    public function login(LoginRequest $request)
    {
        
        $fieldType = filter_var($request->login_field, FILTER_VALIDATE_EMAIL) 
            ? 'email' : 'username';
        $user = User::where($fieldType, $request->login_field)->first();

        if (!$user || !Hash::check($request->password, $user->password)) 
        {
            throw ValidationException::withMessages([
                'login_field' => ['invalid credentials provided'],
            ]);
        }

        $oauthRequest = Request::create('oauth/token', 'POST', [
            'grant_type' => 'password',
            'client_id' => config('passport.client_id'), //needed by Passport for e-mail logins
            'client_secret' => config('passport.client_secret'), //""
            'username' => $user->email, 
            'password' => $request->password,
            'scope' => '', // Define custom scopes if your application uses them (e.g., 'view-profile')
        ]);
        $response = app()->handle($oauthRequest);
        
        // Decode the JSON response from the Passport token endpoint
        $data = json_decode($response->getContent());

        // Return the user data and the generated access token to the frontend
        return response()->json([
            'user' => $user->toArray(), // Optionally return relevant user data
            'access_token' => $data->access_token,
            'refresh_token' => $data->refresh_token ?? null, // Refresh token might not always be present depending on Passport setup
            'expires_in' => $data->expires_in,
            'token_type' => $data->token_type,
        ], $response->getStatusCode());
    }

    public function logout(Request $request)
    {
        // Check if a user is authenticated via Passport
        if ($request->user()) 
        {
            $request->user()->token()->revoke(); // Revoke the current access token
            return response()->json(['message' => 'Successfully logged out.'], 200);
        }

        return response()->json(['message' => 'No user authenticated.'], 401);
    }
}
