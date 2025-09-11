<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'unique:users', // Ensures username is unique in the 'users' table
                'alpha_dash',   // Allows letters, numbers, dashes, and underscores
                                // Or use 'regex:/^[a-zA-Z0-9]+$/' for strictly alphanumeric
            ],
            'email' => [
                'required',
                'string',
                'email',        // Validates email format
                'max:255',
                'unique:users', // Ensures email is unique in the 'users' table
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase() 
                    ->numbers()   // Requires at least one digit
            ],
            // If you send password_confirmation from frontend for server-side match:
            'password_confirmation' => ['required', 'string'],

            'birthdate' => [
                'required',
                'date',        // Validates it's a valid date format
                'before_or_equal:today', // Ensures birthdate is not in the future
                'before_or_equal:' . now()->subYears(13)->format('Y-m-d'), // At least 13 years old
            ],
            'login_type' => [
                'required',
                'string',
                'in:email,google,github', // Ensure it's one of the allowed types
            ],
            'provider_id' => [
                'nullable', // Can be null for email registration
                'string',
                'max:255',
                // Add unique rule if provider_id must be unique across providers for a login_type
                // For example: 'unique:users,provider_id,NULL,id,login_type,' . $this->input('login_type'),
            ],
            'website' => ['max:0'] //honeypot
        ];
    }
    public function messages(): array
    {
        return [
            'birthdate.before_or_equal' => 'You must be at least 13 years old to register.',
            // Add custom messages for other rules if default ones are not descriptive enough
        ];
    }
}
