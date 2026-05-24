<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\AboutController;

Route::get('/', function () {
    return Inertia::render('Home');
});
Route::inertia('/news', 'News');
Route::inertia('/contact', 'Contact');
Route::inertia('/login', 'Login')->name('login');
Route::inertia('/register', 'Registration')->name('register');
Route::inertia('/password-recovery', 'PasswordRecovery');
Route::inertia('/password-change', 'PasswordChange');
Route::inertia('/search', 'SearchResults');

Route::view('/verify', 'emails.verify-email'); //limited use for testing e-mail appearance

Route::get('/email/verify/{id}/{hash}', [App\Http\Controllers\AuthController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');

Route::get('/email/cancel/{id}/{hash}', [App\Http\Controllers\AuthController::class, 'cancelRegistration'])
    ->middleware(['signed']) // IMPORTANT: Use 'signed' middleware
    ->name('registration.cancel');
// Route::get('/corsTest', function ()
// {
//     return dd("ur mom");
// });



// Inertia Routes
Route::get('/user/{username}', [UserController::class, 'user']);
Route::get('/user/{username}/post/{post_url}', [PostController::class, 'show']);
Route::get('/user/{username}/post/{post_url}/edit', [PostController::class, 'edit'])->middleware('auth');
Route::get('/about', [AboutController::class, 'show']);
