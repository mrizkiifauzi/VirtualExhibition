<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\Like;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $user    = $request->user();

        $existing = Like::where('id_user', $user->id_user)
                        ->where('artwork_id', $id)
                        ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            Like::create(['id_user' => $user->id_user, 'artwork_id' => $id]);
            $liked = true;
        }

        $count = Like::where('artwork_id', $id)->count();

        return response()->json([
            'liked'      => $liked,
            'likes_count'=> $count,
        ]);
    }
}
