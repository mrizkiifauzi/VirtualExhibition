<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/artworks/{type}/{filename}', function ($type, $filename) {
    $allowedTypes = ['img', 'video', 'files', 'thumbnails'];
    if (!in_array($type, $allowedTypes)) {
        abort(404);
    }

    $path = storage_path("app/public/artworks/{$type}/{$filename}");

    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path, [
        'Access-Control-Allow-Origin' => 'http://localhost:5173',
    ]);
})->where('filename', '.*');
