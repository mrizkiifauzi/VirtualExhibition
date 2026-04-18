<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ChangePasswordController;
use App\Http\Controllers\ArtworkController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProgramStudiController;
use App\Http\Controllers\SiteStatsController;
use App\Http\Controllers\Admin\AdminController;

// Public Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/forgot-password',      [ForgotPasswordController::class, 'sendLink']);
Route::post('/reset-password',       [ForgotPasswordController::class, 'reset']);
Route::post('/reset-password/check', [ForgotPasswordController::class, 'checkToken']);

// Public Artworks
Route::get('/artworks',              [ArtworkController::class, 'index']);
Route::get('/artworks/{id}',         [ArtworkController::class, 'show']);
Route::get('/artworks/{id}/comments', [CommentController::class, 'index']);
Route::get('/program-studi',         [ProgramStudiController::class, 'index']);
Route::get('/stats',                 [SiteStatsController::class, 'index']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [UserController::class, 'profile']);
    Route::put('/user',    [UserController::class, 'update']);
    Route::put('/user/password', [ChangePasswordController::class, 'update']);

    // Artworks - Upload (mahasiswa)
    Route::post('/artworks',        [ArtworkController::class, 'store']);
    Route::put('/artworks/{id}',    [ArtworkController::class, 'update']);
    Route::delete('/artworks/{id}', [ArtworkController::class, 'destroy']);

    // Interactions
    Route::post('/artworks/{id}/like',    [LikeController::class, 'toggle']);
    Route::post('/artworks/{id}/rating',  [RatingController::class, 'store']);
    Route::post('/artworks/{id}/comment', [CommentController::class, 'store']);
    Route::delete('/comments/{id}',       [CommentController::class, 'destroy']);

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard',             [AdminController::class, 'dashboard']);
        Route::get('/artworks',              [AdminController::class, 'artworks']);
        Route::put('/artworks/{id}/verify',  [AdminController::class, 'verify']);
        Route::put('/artworks/{id}/reject',  [AdminController::class, 'reject']);
        Route::put('/artworks/{id}/position', [AdminController::class, 'setPosition']);
        Route::delete('/artworks/{id}',      [AdminController::class, 'deleteArtwork']);
        Route::get('/users',                 [AdminController::class, 'users']);
        Route::put('/users/{id}/role',       [AdminController::class, 'updateRole']);
        Route::delete('/users/{id}',         [AdminController::class, 'deleteUser']);
    });
});
