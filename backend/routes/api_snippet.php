<?php

// ============================================================
// Tambahkan route ini ke routes/api.php bestehende
// ============================================================

use App\Http\Controllers\Auth\ForgotPasswordController;

// Lupa password — tidak perlu auth
Route::post('/forgot-password',       [ForgotPasswordController::class, 'sendLink']);
Route::post('/reset-password',        [ForgotPasswordController::class, 'reset']);
Route::post('/reset-password/check',  [ForgotPasswordController::class, 'checkToken']);
