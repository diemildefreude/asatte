<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite; // Import Socialite Facade
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // For generating random passwords
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon; // For email_verified_at timestamp
use Illuminate\Validation\Rule;
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
            $reactAppUrl = config('app.react_app_url', 'http://localhost:3000');
            return redirect($reactAppUrl . '/oauth-callback?status=social_provider_not_supported');
        }
        $originPage = $request->query('origin_page', 'login');

        return Socialite::driver($provider)
            ->with(['origin_page' => $originPage])//should work despite Intellephense error        
            ->redirect();
    }

    /**
     * Obtain the user information from the OAuth provider.
     *
     * @param string $provider (e.g., 'google', 'github')
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleProviderCallback(string $provider)
    {
        $reactAppUrl = config('app.react_app_url', 'http://localhost:3000');
        $originPage = 'login'; // Default in case it's missing (shouldn't be if passed)
        try 
        {
            // Get user data from the provider
            $socialiteUser = Socialite::driver($provider)->user();

            if (isset($socialiteUser->original['state'])) 
            {
                $decodedState = json_decode(base64_decode($socialiteUser->original['state']), true);
                if (isset($decodedState['origin_page'])) 
                {
                    $originPage = $decodedState['origin_page'];
                }
            }
            else 
            {
                // Fallback for older Socialite versions or specific providers:
                $rawState = request()->query('state');
                if ($rawState) 
                {
                    try 
                    {
                        $decodedState = json_decode(base64_decode($rawState), true);
                        if (isset($decodedState['origin_page'])) 
                        {
                            $originPage = $decodedState['origin_page'];
                        }
                    } 
                    catch (\Exception $e) 
                    {
                        Log::warning("Failed to decode Socialite state for origin_page: " . $e->getMessage());
                    }
                }
            }

            Log::info("Socialite callback for {$provider}. Provider ID: {$socialiteUser->id} User ID: {$socialiteUser->id}, Email: {$socialiteUser->email}. Origin: {$originPage}");


            // Find user by provider_id and login_type
            $user = User::where('provider_id', $socialiteUser->id)
                        ->where('login_type', $provider)
                        ->first();
            $status = 'social_login_success';

            if ($user) 
            {
                if (!$user->profile_completed) 
                {
                    $status = 'social_registration_incomplete';
                    Log::info("Existing {$provider} user with incomplete profile logged in: {$user->email}");
                } 
            }
            else 
            {
                // User does not exist, check if email already registered via other means
                $user = User::where('email', $socialiteUser->email)->first();

                if ($user) 
                {
                    return redirect($reactAppUrl . '/oauth-callback?' . http_build_query([
                        'status' => 'email_already_registered_social',
                        'email' => $socialiteUser->email,
                        'origin_page' => $originPage, // <--- Pass origin_page in all redirects
                    ]));
                } 
                else 
                {
                    // New user, create an account
                    $now = Carbon::now();
                    Log::info("Creating new {$provider} user: {$socialiteUser->email}. Email_verified_at {$now}");

                    $user = User::forceCreate([
                        //'username' => $proposedUsername,
                        'email' => $socialiteUser->email,
                        'password' => Hash::make(Str::random(24)), // Generate a random password for social users
                        'login_type' => $provider,
                        'provider_id' => $socialiteUser->id,
                        'email_verified_at' => $now, // Email is typically verified by social provider
                        'profile_completed' => false,
                        'accepted_terms_version' => null
                        //'avatar' => $socialiteUser->avatar, // Optional: store avatar URL
                    ]);
                    $status = 'social_registration_incomplete';
                }
            }

            // Generate Passport token for the user
            $token = $user->createToken('authToken')->accessToken;

            return redirect($reactAppUrl . '/oauth-callback?' . http_build_query([
                'access_token' => $token,
                'user' => json_encode($user->toArray()), // Send user data as JSON string
                'status' => $status,
                'origin_page' => $originPage
            ]));

        } 
        catch (QueryException $e) 
        {
            Log::error("Socialite callback QueryException for {$provider}: " . $e->getMessage());
                        
            return redirect($reactAppUrl . '/oauth-callback?' . http_build_query([
                'status' => 'social_login_failed',
                'message' => 'A database error occurred during social login. Please try again or contact support.',
                'origin_page' => $originPage
            ]));
        }
        catch (\Exception $e) 
        {
            Log::error("Socialite callback general error for {$provider}: " . $e->getMessage());
            
            return redirect($reactAppUrl . '/oauth-callback?' . http_build_query([
                'status' => 'social_login_failed',
                'message' => $e->getMessage(),
                'origin_page' => $originPage
            ]));
        }
    }
    public function completeSocialProfile(Request $request)
    {
        $now = Carbon::now();
        Log::info("starting profile completion process at {$now}");
        $user = $request->user();
        Log::info("user found when completing social profile: {$user}");
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
        
        $showEmailField = $request->input('show_email_in_profile');
        $showEmail = isset($showEmailField);

        //Log::info("completing social profile with {$request->username} as username and {$request->birthdate} as birthdate");
        $user->username = $request->username;
        $user->birthdate = $request->birthdate; // Assuming birthdate is also being set here
        $user->show_email_in_profile = $showEmail;
        $user->profile_completed = true; // <--- Mark profile as completed
        $user->accepted_terms_version = config('app.user_agreement_version');
        $user->save();
        //Log::info("User profile completed for: " . $user->email);
        //$reactAppUrl = config('app.react_app_url', 'http://localhost:3000');
        $status = "social_registration_complete";

        // return redirect($reactAppUrl . '/dashboard?' . http_build_query([
        //         'message' => 'Profile completed successfully!',
        //         //'user' => json_encode($user->toArray()), // Send user data as JSON string
        //         'status' => $status,
        //     ]));
        return response()->json([
                'message' => 'Profile completed successfully!', // <--- Top-level message
                'status' => $status
            ], 200);
    }
}