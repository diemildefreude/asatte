<?php

namespace App\Http\Controllers;

use App\Services\MelonlandAuthService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class MelonlandController extends Controller
{
    protected $melonlandService;

    public function __construct(MelonlandAuthService $melonlandService)
    {
        $this->melonlandService = $melonlandService;
    }

    /**
     * Redirect the user to Melonland's auth screen.
     */
    public function redirect(Request $request)
    {
        $originPage = $request->query('origin_page', 'login');
        $request->session()->put('socialite_origin_page', $originPage);

        // Fetch member info to trigger the client key generation and get the connect_url
        $returnPath = parse_url(url('/auth/melonland/callback'), PHP_URL_PATH);
        $memberInfo = $this->melonlandService->getMemberInfo($returnPath, ['email']);

        if ($memberInfo && !$memberInfo->authenticated && isset($memberInfo->connect_url)) {
            return redirect($memberInfo->connect_url);
        }

        // If they are somehow already authenticated on the very first redirect, just send them to callback
        if ($memberInfo && $memberInfo->authenticated) {
            return redirect('/auth/melonland/callback');
        }

        Log::error("Failed to generate Melonland connect URL.", (array) $memberInfo);
        return redirect('/login')->with('error', 'Unable to connect to Melonland. Please try again.');
    }

    /**
     * Handle the callback from Melonland.
     */
    public function callback(Request $request)
    {
        try 
        {
            $returnPath = parse_url(url('/auth/melonland/callback'), PHP_URL_PATH);
            $memberInfo = $this->melonlandService->getMemberInfo($returnPath, ['email']);

            if (!$memberInfo || !$memberInfo->authenticated) {
                Log::error("Melonland callback failed authentication.", (array) $memberInfo);
                return redirect('/login')->with('error', 'Melonland authentication failed or was cancelled.');
            }

            // We need a unique ID from Melonland. The API returns 'id' (numeric ID on forum)
            // It also returns 'displayname', 'accountname', and 'email' (if requested).
            $providerId = $memberInfo->id;
            $email = $memberInfo->email ?? null;

            if (!$email) {
                return redirect('/login')->with('error', 'We need your email from Melonland to create an account.');
            }

            // Find user by provider_id and login_type
            $user = User::where('provider_id', $providerId)
                        ->where('login_type', 'melonland')
                        ->first();

            $status = 'social_login_success';

            if ($user) {
                if (!$user->profile_completed) {
                    $status = 'social_registration_incomplete';
                }
            } else {
                // User does not exist, check if email already registered via other means
                $existing = User::where('email', $email)->first();
                if ($existing) {
                    return redirect('/login')->with('error', 'That email is already registered. Please login with your original account.');
                }

                // New user: create account (mark profile incomplete)
                $now = Carbon::now();

                $user = User::forceCreate([
                    'email' => $email,
                    'password' => Hash::make(Str::random(24)),
                    'login_type' => 'melonland',
                    'provider_id' => $providerId,
                    'email_verified_at' => $now,
                    'profile_completed' => false,
                    'accepted_terms_version' => null,
                ]);

                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SocialWelcome($email, 'Melonland'));

                $status = 'social_registration_incomplete';
            }

            // Log the user into the web session
            Auth::login($user);
            $request->session()->regenerate();

            // Redirect to the dashboard
            if (!$user->profile_completed) {
                return redirect()->intended('/dashboard?status=' . $status);
            }
            return redirect()->intended('/dashboard');

        } catch (\Exception $e) {
            Log::error("Melonland callback general error: " . $e->getMessage());
            return redirect('/login')->with('message', 'An unexpected authentication error occurred.');
        }
    }
}
