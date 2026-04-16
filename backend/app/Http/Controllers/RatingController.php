<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\Rating;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request, $id)
    {
        $request->validate([
            'nilai' => 'required|integer|min:1|max:5',
        ]);

        $artwork = Artwork::findOrFail($id);
        $user    = $request->user();

        $rating = Rating::updateOrCreate(
            ['id_user' => $user->id_user, 'artwork_id' => $id],
            ['nilai'   => $request->nilai]
        );

        $avg = Rating::where('artwork_id', $id)->avg('nilai');

        return response()->json([
            'message'       => 'Rating berhasil disimpan.',
            'user_rating'   => $rating->nilai,
            'ratings_avg'   => round($avg, 1),
        ]);
    }
}
