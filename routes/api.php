<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DMController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$throttleTime = 4;

// Route::get('/user/{username}', [UserController::class, 'user']); // Migrated to web.php
Route::get('/usersearch/{searchterm}', [UserController::class, 'userSearch']);

// Route::get('/posts', [PostController::class, 'index']); // Migrated to partials in web.php
// Route::get('/user/{username}/post/{post_url}', [PostController::class, 'show']); // Migrated to web.php

// Route::get('/{post}/comments', [CommentController::class, 'index']); // Migrated to web.php

Route::post('/send-contact-mail', [ContactController::class, 'sendContactMail'])
    ->middleware("throttle:$throttleTime,1");

// Auth endpoints (login/register/password) moved to web.php for session-based auth

// Route::post('/posts/{post}/record-view', [ActivityController::class, 'recordView']); // Migrated to web.php

// Route::get('/about', [AboutController::class, 'show']); // Migrated to web.php

Route::middleware('auth')->group(function ()
{
    Route::put('/update-about', [AboutController::class, 'update']);
    // Routes below have been migrated to web.php:
    // Route::put('set-admin-hide/{post}', [PostController::class, 'toggleAdminHide']);
    // Route::get('/my-posts', [PostController::class, 'myPosts']);
    // Route::resource('posts', PostController::class)->except(['index', 'show', 'edit']);
    // Route::resource('comments', CommentController::class)->except(['store', 'update']);
    // Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('posts.comments.store');
    // Route::put('/posts/{post}/comments/{comment}', [CommentController::class, 'update'])->name('posts.comments.update');
    // Route::delete('/posts/{post}/comments/{comment}', [CommentController::class, 'destroy'])->name('posts.comments.destroy');
    // Route::post('/posts/{post}/like', [ActivityController::class, 'toggleLike']);
    // Route::post('/{user}/follow', [ActivityController::class, 'toggleFollow']);

    Route::post('/update-profile', [DashboardController::class, 'updateProfile']);
    Route::post('/update-bio', [DashboardController::class, 'updateBio']);
    Route::post('/update-avatar', [DashboardController::class, 'updateAvatar']);
    Route::get('/unread-status', [DashboardController::class, 'unreadStatus']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Socialite endpoints moved to web.php
