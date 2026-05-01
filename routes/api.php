<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DMController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user/{username}', [UserController::class, 'user']);
Route::get('/{user}/following', [UserController::class, 'following']);
Route::get('/{user}/followers', [UserController::class, 'followers']);
Route::get('/usersearch/{searchterm}', [UserController::class, 'userSearch']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/user/{username}/post/{post_url}', [PostController::class, 'show']);

Route::get('/{post}/comments', [CommentController::class, 'index']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/request-recovery', [AuthController::class, 'sendRecoveryLink']);

Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/posts/{post}/record-view', [ActivityController::class, 'recordView']);

Route::get('/about', [AboutController::class, 'show']);

Route::middleware('auth:api')->group(function ()
{
    Route::put('/update-about', [AboutController::class, 'update']);
    Route::put('set-admin-hide/{post}', [PostController::class, 'toggleAdminHide']);
 
    Route::get('/my-posts', [PostController::class, 'myPosts']);
    Route::get('/my-liked-posts', [PostController::class, 'myLikedPosts']);
    Route::get('/post-search', [PostController::class, 'postSearch']);
    Route::resource('posts', PostController::class)->except([
        'index', 'show'
    ]);
//----------    
    Route::resource('comments', CommentController::class)->except([
        'store', 'update'
    ]);
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])
        ->name('posts.comments.store');
    Route::put('/posts/{post}/comments/{comment}', [CommentController::class, 'update'])
        ->name('posts.comments.update');
    Route::delete('/posts/{post}/comments/{comment}', [CommentController::class, 'destroy'])
        ->name('posts.comments.destroy');
//----------
    Route::resource('direct-mails', DMController::class);    
    //Route::get('/conversation/{id}', [DMController::class, '']);

//------------
    Route::post('/posts/{post}/like', [ActivityController::class, 'toggleLike']);
    Route::post('/{user}/follow', [ActivityController::class, 'toggleFollow']);
    Route::get('/notifications', [ActivityController::class, 'notifications']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/resend-verification', [AuthController::class, 'sendVerifyLink']);//, 'throttle:6,1']); // Auth for logged-in user, throttle to prevent abuse
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/complete-social-profile', [SocialiteController::class, 'completeSocialProfile']);
    Route::post('/update-profile', [DashboardController::class, 'updateProfile']);
    Route::post('/update-bio', [DashboardController::class, 'updateBio']);
    Route::post('/update-avatar', [DashboardController::class, 'updateAvatar']);
    Route::get('/unread-status', [DashboardController::class, 'unreadStatus']);
    Route::get('/user', function (Request $request) 
    {
        return $request->user();
    });    
});

Route::middleware('web')->group(function ()
{
    Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirectToProvider']);
    Route::get('/auth/{provider}/callback', [SocialiteController::class, 'handleProviderCallback']);
});
