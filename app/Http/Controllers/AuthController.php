<?php

namespace App\Http\Controllers;

use App\Enums\LoginType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Auth;

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
            
            Auth::login($user);
            Auth::logoutOtherDevices($password);
        });

        if ($status == Password::PASSWORD_RESET) 
        {
            Log::info("Password successfully reset for email: " . $request->email);
            return redirect('/dashboard')->with('success', 'Your password has been successfully reset.')
                         ->with('status', 'password_reset_success');
        }

        return back()->with('status', 'password_reset_failed')
                     ->withErrors(['email' => 'Unable to reset password. Please try again later.']);
    }
    public function changePassword(Request $request)
    {
        Log::info("changePassword method called");
        if(!$request->user()->hasVerifiedEmail())
        {
            Log::error("e-mail not verified");
            return back()->with('status', 'change_pass_unverified')
                         ->withErrors(['general' => 'Your email address must be verified to change your password.']);
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
            return back()->with('status', 'old_password_incorrect')
                         ->withErrors(['old_password' => 'The provided password does not match your current password.']);
        }

        $user->password = $request->new_password;
        $user->save();

        Auth::logoutOtherDevices($request->new_password);

        return redirect('/dashboard')->with('status', 'password_changed')
                     ->with('success', 'Your password has been changed successfully.');

    }
    public function sendRecoveryLink(Request $request)
    {
        $fieldType = filter_var($request->login_field, FILTER_VALIDATE_EMAIL) 
            ? 'email' : 'username';
        $user = User::where($fieldType, $request->login_field)->first();

        if (!$user) 
        {
            Log::info("Password reset attempt for non-existent user: " . $request->login_field);
            return back()->with('status', 'password_reset_link_sent')
                         ->with('message', 'If an account with that email/username exists, a recovery e-mail as been sent to you.');
        }

        $status = Password::sendResetLink(
            ['email' => $user->email] // The broker expects an array with 'email'
        );

        if ($status == Password::RESET_LINK_SENT) 
        {
            Log::info("Password reset link sent to: " . $user->email);
            return back()->with('status', 'password_reset_link_sent')
                         ->with('success', 'If an account with that email/username exists, a password reset link has been sent.');
        }

        Log::error("Failed to send password reset link to: " . $user->email . " Status: " . $status);
        return back()->with('status', 'password_reset_link_failed')
                     ->withErrors(['general' => 'Unable to send password reset link. Please try again later.']);

    }
    public function sendVerifyLink(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) 
        {
            return back()->with('status', 'send_link_already_verified');
        }
        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'send_link_sent');
    }
    public function verifyEmail (Request $request, string $id, string $hash) 
    {
        try
        {
            $user = User::findOrFail($id);

            if (! hash_equals((string) $hash, sha1($user->email))) 
            {
                return redirect('/dashboard?status=invalid_link');
            }
            if ($user->hasVerifiedEmail())
            {
                return redirect('/dashboard?status=verify_already_verified');
            }

            // 4. Mark the email as verified
            $user->markEmailAsVerified(); 
        
            return redirect('/dashboard?status=verify_verified');
        }
        catch (ModelNotFoundException $e) 
        {
            // User was not found, meaning they likely already cancelled or the link is invalid
            Log::info("Attempt to verify non-existent user ID {$id}. Likely already canceled.");
            return redirect('/dashboard?status=verify_already_canceled'); // New status for frontend
        } 
    }
    public function cancelRegistration(Request $request, int $id, string $hash)
    {        
        try
        {
            $user = User::findOrFail($id);

            if (!hash_equals((string) $hash, sha1($user->email))) 
            {
                return redirect('/login?status=invalid_link');
            }

            if ($user->hasVerifiedEmail()) 
            {
                return redirect('/login?status=cancel_already_verified');
            }        

            $user->delete(); // Delete the user record
            Log::info("User ID {$user->id} with email {$user->email} cancelled registration.");
            return redirect('/login?status=cancel_success');
        }
        catch (ModelNotFoundException $e) 
        {
            // User was not found, meaning they likely already cancelled or the link is invalid
            Log::info("Attempt to cancel non-existent user ID {$id}. Likely already canceled.");
            return redirect('/login?status=invalid_link'); // New status for frontend
        } 
        catch (\Exception $e) 
        {
            // Catch any other unexpected errors
            Log::error("Unexpected error canceling registration for user ID {$id}: " . $e->getMessage());
            return redirect('/login?status=cancel_error');
        }
    }
    public function checkAvailability(Request $request)
    {
        // Run the identical unique validation rule
        $request->validate([
            'username' => 'sometimes|string|unique:users,username',
            'email' => 'sometimes|email|unique:users,email',
        ]);

        // If validation passes, return absolutely nothing. 
        // Inertia will clear the error prop for this field.
        return back();
    }
    public function register(RegisterRequest $request)
    {
        $hasHoneypotField = $request->input('is_user_human'); 
        $hasRobotField = $request->input('is_user_robot');

        if ($hasHoneypotField || $hasRobotField) 
        {
            return redirect('/')->with('status', 'happy_landings');
        }

        $request->validated();

        $formattedBirthdate = Carbon::parse($request->birthdate)->format('Y-m-d');
        $showEmailInProfile = $request->filled('show_email_in_profile');

        $user = User::forceCreate([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthdate' => $formattedBirthdate,
            'login_type' => LoginType::Email,
            'provider_id' => null,
            'profile_completed' => true,
            'show_email_in_profile' => $showEmailInProfile,
            'bio' => '',
            'accepted_terms_version' => config('app.user_agreement_version')
        ]);

        $user->sendEmailVerificationNotification();

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }
    public function login(LoginRequest $request)
    {
        $fieldType = filter_var($request->login_field, FILTER_VALIDATE_EMAIL) 
            ? 'email' : 'username';
        $user = User::where($fieldType, $request->login_field)->first();

        if (!$user || !Hash::check($request->password, $user->password)) 
        {
            throw ValidationException::withMessages([
                'general' => ['invalid credentials provided'],
            ]);
        }
        //Log::info('Checking target Client ID value:', ['client_id' => config('passport.client_id')]);
        $fieldType = filter_var($request->login_field, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [$fieldType => $request->login_field, 'password' => $request->password];

        if (Auth::attempt($credentials, $request->filled('remember'))) 
        {
            $request->session()->regenerate();
            return redirect('/dashboard');
        }

        return back()->withErrors(['general' => ['invalid credentials provided']])->withInput();
    }

    // (Cookie/token refresh removed — using native web session auth)

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
