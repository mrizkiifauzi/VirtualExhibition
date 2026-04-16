<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\User;

class SiteStatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_artworks' => Artwork::where('status', 'verified')->count(),
            'total_users' => User::count(),
        ]);
    }
}
