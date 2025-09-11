<?php

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

Route::get('/corsTest', function ()
{
    return dd("ur mom");
});

Route::resource('posts', PostController::class);
