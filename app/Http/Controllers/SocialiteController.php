<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite; // Import Socialite Facade
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // For generating random passwords
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon; // For email_verified_at timestamp
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class SocialiteController extends Controller
{
    /**
     * Redirect the user to the OAuth provider's authentication page.
     *
     * @param string $provider (e.g., 'google', 'github')
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToProvider(string $provider, Request $request)
    {
        // Check if the provider is supported
        if (!in_array($provider, ['google', 'github'])) {
            // Redirect back to frontend with an error status
            $reactAppUrl = config('app.url', 'http://localhost:3000');
            return redirect($reactAppUrl . '/oauth-callback?status=social_provider_not_supported');
        }
        $originPage = $request->query('origin_page', 'login');
        // Store the origin page in session so we can validate it after callback
        $request->session()->put('socialite_origin_page', $originPage);

        if ($provider === 'google') {
            return Socialite::driver($provider)
                ->with(['prompt' => 'select_account'])
                ->redirect();
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the OAuth provider.
     *
     * @param string $provider (e.g., 'google', 'github')
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleProviderCallback(string $provider, Request $request)
    {

        // First, prefer any origin_page stored in session (we put it there before redirecting)
        $originPage = $request->session()->pull('socialite_origin_page', 'login');

        // 1. Strict allowlist for frontend pages
        $allowedOriginPages = ['login', 'register'];

        try {
            // Also support the encoded state payload if present (legacy behavior)
            $rawState = $request->query('state');
            if ($rawState) {
                $decoded = json_decode(base64_decode($rawState), true);
                if (isset($decoded['origin_page']) && in_array($decoded['origin_page'], $allowedOriginPages, true)) {
                    $originPage = $decoded['origin_page'];
                } else {
                    Log::warning("Unauthorized origin_page attempted in Socialite state: " . ($decoded['origin_page'] ?? ''));
                }
            }

            // Retrieve user via Socialite. If the state was tampered with relative to the session,
            // Socialite will throw an InvalidStateException on ->user().
            $socialiteUser = Socialite::driver($provider)->user();



            // Find user by provider_id and login_type
            $user = User::where('provider_id', $socialiteUser->id)
                        ->where('login_type', $provider)
                        ->first();

            $status = 'social_login_success';

            if ($user) {
                if (!$user->profile_completed) {
                    $status = 'social_registration_incomplete';

                }
            } else {
                // User does not exist, check if email already registered via other means
                $existing = User::where('email', $socialiteUser->email)->first();
                if ($existing) {

                    return redirect('/login')->with('message', 'That email is already registered. Please login with your account.');
                }

                // New user: create account (mark profile incomplete)
                $now = Carbon::now();


                $user = User::forceCreate([
                    'email' => $socialiteUser->email,
                    'password' => Hash::make(Str::random(24)),
                    'login_type' => $provider,
                    'provider_id' => $socialiteUser->id,
                    'email_verified_at' => $now,
                    'profile_completed' => false,
                    'accepted_terms_version' => null,
                ]);
                $status = 'social_registration_incomplete';
            }

            // Log the user into the web session (session-based auth)
            Auth::login($user);
            $request->session()->regenerate();

            // Redirect to the dashboard (or dashboard with status if profile incomplete)
            if (!$user->profile_completed) {
                return redirect()->intended('/dashboard?status=' . $status);
            }
            return redirect()->intended('/dashboard');

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            Log::error("Socialite state/CSRF validation failed for {$provider}: " . $e->getMessage());
            return redirect('/login')->with('message', 'Session expired or invalid authentication request. Please try again.');
        } catch (QueryException $e) {
            Log::error("Socialite callback QueryException for {$provider}: " . $e->getMessage());
            return redirect('/login')->with('message', 'A database error occurred during social login.');
        } catch (\Exception $e) {
            Log::error("Socialite callback general error for {$provider}: " . $e->getMessage());
            return redirect('/login')->with('message', 'An unexpected authentication error occurred.');
        }
    }
    public function completeSocialProfile(Request $request)
    {
        $now = Carbon::now();

        $user = $request->user();


        if (!$user) 
        {
            throw ValidationException::withMessages([
                'general' => ['account not found'],
            ]);
        }
        
        $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:255',
                Rule::unique('users')->ignore($user->id),
                'alpha_dash',
            ],
            'birthdate' => [
                'required',
                'date',        // Validates it's a valid date format
                'before_or_equal:today', // Ensures birthdate is not in the future
                'before_or_equal:' . now()->subYears(13)->format('Y-m-d'), // At least 13 years old
            ],
        ]);
        
        $showEmail = $request->boolean('show_email_in_profile');


        $user->username = $request->username;
        $user->birthdate = $request->birthdate; // Assuming birthdate is also being set here
        $user->show_email_in_profile = $showEmail;
        $user->profile_completed = true; // <--- Mark profile as completed
        $user->accepted_terms_version = config('app.user_agreement_version');
        $user->save();

        //$reactAppUrl = config('app.url', 'http://localhost:3000');
        $status = "social_registration_complete";

        $request->session()->flash('status', 'social_registration_complete');
        
        return redirect('/dashboard')->with([
                'status' => $status,
                'success' => 'Profile completed successfully!'
            ]);
    }
}