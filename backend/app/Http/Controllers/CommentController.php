<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index($id)
    {
        $comments = Comment::with('user:id_user,name,foto_profil')
                           ->where('artwork_id', $id)
                           ->latest()
                           ->paginate(20);

        return response()->json($comments);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'isi' => 'required|string|max:1000',
        ]);

        $artwork = Artwork::findOrFail($id);
        $user    = $request->user();

        $comment = Comment::create([
            'id_user'    => $user->id_user,
            'artwork_id' => $id,
            'isi'        => $request->isi,
        ]);

        $comment->load('user:id_user,name,foto_profil');

        return response()->json(['message' => 'Komentar berhasil ditambahkan.', 'comment' => $comment], 201);
    }

    public function destroy(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $user    = $request->user();

        if ($comment->id_user !== $user->id_user && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus.']);
    }
}
