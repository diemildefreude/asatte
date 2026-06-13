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
use App\Http\Controllers\SitemapController;

Route::get('/', [HomeController::class, 'index']);
Route::get('/news', [NewsController::class, 'index']);
Route::inertia('/contact', 'Contact');
Route::post('/contact', [ContactController::class, 'sendContactMail'])->name('contact.send')->middleware('throttle:3,1');
Route::inertia('/login', 'Login')->name('login');
Route::inertia('/register', 'Registration')->name('register');
Route::inertia('/password-recovery', 'PasswordRecovery');
Route::inertia('/password-change', 'PasswordChange');
Route::inertia('/password-reset', 'PasswordReset');
Route::get('/search', [SearchController::class, 'search']);
Route::get('/api/usersearch/{searchterm}', [UserController::class, 'userSearch']);
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// Session-based auth endpoints
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt')->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->name('register.attempt')->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/register/check', [AuthController::class, 'checkAvailability']);
Route::post('/request-recovery', [AuthController::class, 'sendRecoveryLink'])->name('password.request')->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset')->middleware('throttle:5,1');
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
Route::get('/posts', [App\Http\Controllers\PostController::class, 'index'])->name('posts.index');
Route::post('/posts/{post}/record-view', [App\Http\Controllers\ActivityController::class, 'recordView'])->name('posts.recordView');


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

// Dashboard subpages
Route::get('/dashboard/activity', [App\Http\Controllers\DashboardController::class, 'activity'])->middleware('auth')->name('dashboard.activity');
Route::get('/dashboard/liked-posts', [App\Http\Controllers\PostController::class, 'myLikedPosts'])->middleware('auth')->name('dashboard.likedPosts');
Route::get('/dashboard/comments', [App\Http\Controllers\CommentController::class, 'index'])->middleware('auth')->name('dashboard.comments');
Route::get('/dashboard/notifications', [App\Http\Controllers\ActivityController::class, 'notifications'])->middleware('auth')->name('dashboard.notifications');
Route::get('/dashboard/following', [App\Http\Controllers\UserController::class, 'following'])->middleware('auth')->name('dashboard.following');
Route::get('/dashboard/followers', [App\Http\Controllers\UserController::class, 'followers'])->middleware('auth')->name('dashboard.followers');

Route::get('/dashboard/mail', [App\Http\Controllers\DMController::class, 'index'])->middleware('auth')->name('dashboard.mail.index');
Route::get('/dashboard/mail/new', [App\Http\Controllers\DMController::class, 'create'])->middleware('auth')->name('dashboard.mail.create');
Route::get('/dashboard/mail/{conversation}', [App\Http\Controllers\DMController::class, 'show'])->middleware('auth')->name('dashboard.mail.show');
Route::post('/dashboard/mail', [App\Http\Controllers\DMController::class, 'store'])->middleware('auth')->name('dashboard.mail.store');
Route::put('/dashboard/mail/{message}', [App\Http\Controllers\DMController::class, 'update'])->middleware('auth')->name('dashboard.mail.update');
Route::delete('/dashboard/mail/{message}', [App\Http\Controllers\DMController::class, 'destroy'])->middleware('auth')->name('dashboard.mail.destroy');

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

// Post/Comment interactions (migrated from API)
Route::middleware('auth')->group(function () {
    Route::get('/my-posts', [App\Http\Controllers\PostController::class, 'myPosts'])->name('myPosts');
    Route::put('/set-admin-hide/{post}', [App\Http\Controllers\PostController::class, 'toggleAdminHide'])->name('posts.toggleAdminHide');
    Route::post('/posts/{post}/like', [App\Http\Controllers\ActivityController::class, 'toggleLike'])->name('posts.like');
    Route::post('/{user}/follow', [App\Http\Controllers\ActivityController::class, 'toggleFollow'])->name('users.follow');
    
    // Comments
    Route::post('/posts/{post}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('posts.comments.store');
    Route::put('/posts/{post}/comments/{comment}', [App\Http\Controllers\CommentController::class, 'update'])->name('posts.comments.update');
    Route::delete('/posts/{post}/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy'])->name('posts.comments.destroy');

    // Migrated from api.php
    Route::put('/api/update-about', [App\Http\Controllers\AboutController::class, 'update']);
    Route::post('/api/update-profile', [App\Http\Controllers\DashboardController::class, 'updateProfile']);
    Route::post('/api/update-bio', [App\Http\Controllers\DashboardController::class, 'updateBio']);
    Route::post('/api/update-avatar', [App\Http\Controllers\DashboardController::class, 'updateAvatar']);
    Route::get('/api/unread-status', [App\Http\Controllers\DashboardController::class, 'unreadStatus']);
    Route::get('/api/user', function (Illuminate\Http\Request $request) {
        return $request->user();
    });
});

// User public profile routes
Route::get('/{username}', [App\Http\Controllers\UserController::class, 'user'])->name('user.profile');
Route::get('/{username}/profile', [App\Http\Controllers\UserController::class, 'user']);
Route::get('/{username}/posts', [App\Http\Controllers\UserController::class, 'posts'])->name('user.posts');
Route::get('/{username}/following', [App\Http\Controllers\UserController::class, 'following'])->name('user.following');
Route::get('/{username}/followers', [App\Http\Controllers\UserController::class, 'followers'])->name('user.followers');

// Fallback user post route
Route::get('/{username}/{post_url}', [App\Http\Controllers\PostController::class, 'show'])->name('posts.show');
