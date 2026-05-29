<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialiteController;

Route::get('/', [HomeController::class, 'index']);
Route::get('/news', [NewsController::class, 'index']);
Route::inertia('/contact', 'Contact');
Route::post('/contact', [ContactController::class, 'sendContactMail'])->name('contact.send');
Route::inertia('/login', 'Login')->name('login');
Route::inertia('/register', 'Registration')->name('register');
Route::inertia('/password-recovery', 'PasswordRecovery');
Route::inertia('/password-change', 'PasswordChange');
Route::get('/search', [SearchController::class, 'search']);

// Session-based auth endpoints
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/register', [AuthController::class, 'register'])->name('register.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/request-recovery', [AuthController::class, 'sendRecoveryLink'])->name('password.request');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth')->name('password.change');
Route::post('/resend-verification', [AuthController::class, 'sendVerifyLink'])->middleware('auth')->name('verification.resend');
Route::post('/complete-social-profile', [SocialiteController::class, 'completeSocialProfile'])->middleware('auth')->name('social.complete');

// Socialite (OAuth) routes
Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialiteController::class, 'handleProviderCallback']);
// Support legacy/api-style callback paths if external providers are configured that way
Route::get('/api/auth/{provider}/redirect', [SocialiteController::class, 'redirectToProvider']);
Route::get('/api/auth/{provider}/callback', [SocialiteController::class, 'handleProviderCallback']);

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
Route::get('/about', [AboutController::class, 'show'])->name('about');
// Web (Inertia) endpoint to update About (session-based)
Route::post('/update-about', [App\Http\Controllers\AboutController::class, 'update'])->middleware('auth')->name('about.update');

// Dashboard (Inertia) - session protected. Specific dashboard subpages first.
Route::get('/dashboard/posts', [App\Http\Controllers\DashboardController::class, 'posts'])->middleware('auth')->name('dashboard.posts');
Route::get('/dashboard/news-posts', [App\Http\Controllers\DashboardController::class, 'newsPosts'])->middleware('auth')->name('dashboard.news');
// New / Edit pages for posts (Inertia)
Route::inertia('/dashboard/new-post', 'dashboard/NewPost')->middleware('auth')->name('dashboard.newPost');
Route::inertia('/dashboard/new-news-post', 'dashboard/NewNewsPost')->middleware('auth')->name('dashboard.newNewsPost');
Route::get('/dashboard/edit-post/{post_url}', [App\Http\Controllers\DashboardController::class, 'editPost'])->middleware('auth')->name('dashboard.editPost');

// Fallback: catch-all dashboard route
Route::inertia('/dashboard', 'Dashboard')->middleware('auth')->name('dashboard');
Route::inertia('/dashboard/{any}', 'Dashboard')->where('any', '.*')->middleware('auth');

// Dashboard update endpoints (session-based web routes)
Route::post('/update-profile', [App\Http\Controllers\DashboardController::class, 'updateProfile'])->middleware('auth')->name('dashboard.updateProfile');
Route::post('/update-bio', [App\Http\Controllers\DashboardController::class, 'updateBio'])->middleware('auth')->name('dashboard.updateBio');
Route::post('/update-avatar', [App\Http\Controllers\DashboardController::class, 'updateAvatar'])->middleware('auth')->name('dashboard.updateAvatar');
// Web (session) post management endpoints
Route::post('/posts', [App\Http\Controllers\PostController::class, 'store'])->middleware('auth')->name('posts.store');
Route::put('/posts/{post}', [App\Http\Controllers\PostController::class, 'update'])->middleware('auth')->name('posts.update');
Route::delete('/posts/{post}', [App\Http\Controllers\PostController::class, 'destroy'])->middleware('auth')->name('posts.destroy');
