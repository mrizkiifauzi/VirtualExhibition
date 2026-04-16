<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArtworkController extends Controller
{
    public function index(Request $request)
    {
        $query = Artwork::with(['user:id_user,name,nim', 'programStudi:id_prodi,nama_prodi'])
            ->where('status', 'verified');

        if ($request->id_prodi) {
            $query->where('id_prodi', $request->id_prodi);
        }
        if ($request->search) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }
        if ($request->tipe) {
            $query->where('tipe', $request->tipe);
        }

        $artworks = $query->withCount(['likes', 'comments'])
            ->withAvg('ratings', 'nilai')
            ->latest()
            ->paginate(12);

        // Append user's like/rating if logged in
        if (auth('sanctum')->check()) {
            $userId = auth('sanctum')->id();
            $artworks->getCollection()->transform(function ($artwork) use ($userId) {
                $artwork->user_liked  = $artwork->likes()->where('id_user', $userId)->exists();
                $artwork->user_rating = $artwork->ratings()->where('id_user', $userId)->value('nilai');
                return $artwork;
            });
        }

        return response()->json($artworks);
    }

    public function show($id)
    {
        $artwork = Artwork::with(['user:id_user,name,nim,foto_profil', 'programStudi:id_prodi,nama_prodi'])
            ->withCount(['likes', 'comments'])
            ->withAvg('ratings', 'nilai')
            //   ->where('status', 'verified')
            ->findOrFail($id);

        // Kirim error jika orang lain mencoba akses karya yang belum verified
        if ($artwork->status !== 'verified' && (!auth('sanctum')->check() || auth('sanctum')->id() !== $artwork->id_user)) {
            if (auth('sanctum')->user()->role !== 'admin') {
                abort(404, 'Karya belum diverifikasi');
            }
        }

        if (auth('sanctum')->check()) {
            $userId = auth('sanctum')->id();
            $artwork->user_liked  = $artwork->likes()->where('id_user', $userId)->exists();
            $artwork->user_rating = $artwork->ratings()->where('id_user', $userId)->value('nilai');
        }

        return response()->json($artwork);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul'       => 'required|string|max:255',
            'deskripsi'   => 'nullable|string',
            'id_prodi'    => 'nullable|exists:program_studi,id_prodi',
            'tipe'        => 'required|in:image,video,3d',
            'file'        => 'required|file|mimes:jpg,jpeg,png,mp4,glb,gltf|max:102400',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $user = $request->user();
        if ($user->role !== 'mahasiswa' && $user->role !== 'admin') {
            return response()->json(['message' => 'Hanya mahasiswa yang dapat mengupload karya.'], 403);
        }

        $filePath = $request->file('file')->store('artworks/files', 'public');
        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('artworks/thumbnails', 'public');
        }

        $artwork = Artwork::create([
            'id_user'    => $user->id_user,
            'id_prodi'   => $request->id_prodi,
            'judul'      => $request->judul,
            'deskripsi'  => $request->deskripsi,
            'tipe'       => $request->tipe,
            'file_path'  => $filePath,
            'thumbnail'  => $thumbnailPath,
            'status'     => 'pending',
        ]);

        return response()->json(['message' => 'Karya berhasil diupload, menunggu verifikasi.', 'artwork' => $artwork], 201);
    }

    public function update(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $user = $request->user();

        if ($artwork->id_user !== $user->id_user && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'judul'     => 'sometimes|string|max:255',
            'deskripsi' => 'nullable|string',
            'id_prodi'  => 'nullable|exists:program_studi,id_prodi',
        ]);

        $artwork->update($request->only(['judul', 'deskripsi', 'id_prodi']));

        return response()->json(['message' => 'Karya berhasil diupdate.', 'artwork' => $artwork]);
    }

    public function destroy(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $user = $request->user();

        if ($artwork->id_user !== $user->id_user && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($artwork->file_path);
        if ($artwork->thumbnail) {
            Storage::disk('public')->delete($artwork->thumbnail);
        }

        $artwork->delete();

        return response()->json(['message' => 'Karya berhasil dihapus.']);
    }
}
