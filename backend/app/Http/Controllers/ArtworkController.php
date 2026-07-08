<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\ImageManager;

class ArtworkController extends Controller
{
    public function index(Request $request)
    {
        $query = Artwork::with(['user:id_user,name,nim', 'programStudi:id_prodi,nama_prodi']);

        if ($request->my && auth('sanctum')->check()) {
            $query->where('id_user', auth('sanctum')->id());
        } else {
            $query->where('status', 'verified');
        }

        if ($request->id_prodi) {
            $query->where('id_prodi', $request->id_prodi);
        }

        if ($request->search) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        if ($request->tipe) {
            $query->where('tipe', $request->tipe);
        }

        if ($request->tahun) {
            $query->whereYear('created_at', $request->tahun);
        }

        if ($request->sort === 'best') {
            $query->where(function ($q) {
                $q->whereHas('ratings')
                    ->orWhereHas('likes');
            })
                ->orderBy('ratings_avg_nilai', 'desc')
                ->orderBy('likes_count', 'desc');
        } else {
            $query->latest();
        }

        $artworks = $query->withCount(['likes', 'comments'])
            ->withAvg('ratings', 'nilai')
            ->paginate(12);

        // Tambahkan info user (like & rating)
        if (auth('sanctum')->check()) {
            $userId = auth('sanctum')->id();

            $artworks->getCollection()->load([
                'likes' => fn($q) => $q->where('id_user', $userId),
                'ratings' => fn($q) => $q->where('id_user', $userId),
            ]);

            $artworks->getCollection()->transform(function ($artwork) {
                $artwork->user_liked  = $artwork->likes->isNotEmpty();
                $artwork->user_rating = optional($artwork->ratings->first())->nilai;
                return $artwork;
            });
        }

        return response()->json($artworks);
    }

    public function show($id)
    {
        $artwork = Artwork::with([
            'user:id_user,name,nim,foto_profil',
            'user.programStudi:id_prodi,nama_prodi',
            'programStudi:id_prodi,nama_prodi'
        ])
            ->withCount(['likes', 'comments'])
            ->withAvg('ratings', 'nilai')
            ->findOrFail($id);

        // Proteksi karya yang belum verified
        if ($artwork->status !== 'verified') {
            if (!auth('sanctum')->check()) {
                abort(404, 'Karya belum diverifikasi');
            }

            $user = auth('sanctum')->user();

            if ($user->id_user !== $artwork->id_user && $user->role !== 'admin') {
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
            'tipe'        => 'required|in:image,video',
            'file'        => 'required|file|mimes:jpg,jpeg,png,mp4|max:102400',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $user = $request->user();

        if (!in_array($user->role, ['mahasiswa', 'admin'])) {
            return response()->json(['message' => 'Hanya mahasiswa yang dapat mengupload karya.'], 403);
        }

        $directory = match ($request->tipe) {
            'image' => 'artworks/img',
            'video' => 'artworks/video',
            default => 'artworks/files',
        };

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();

        // ganti public_path() -> storage_path('app/public/...')
        $destination = storage_path('app/public/' . $directory);
        if (!file_exists($destination)) {
            mkdir($destination, 0755, true);
        }

        $filePath = $directory . '/' . $filename;

        if ($request->tipe === 'image') {
            $imageManager = new ImageManager(GdDriver::class);
            $optimizedImage = $imageManager
                ->decodePath($file->getRealPath())
                ->resize(1600, null);

            $optimizedImage
                ->encodeUsingFileExtension('jpg', 80)
                ->save($destination . DIRECTORY_SEPARATOR . $filename);
        } else {
            $file->move($destination, $filename);
        }

        $thumbnailPath = null;

        if ($request->hasFile('thumbnail')) {
            $thumb = $request->file('thumbnail');
            $thumbName = time() . '_thumb_' . $thumb->getClientOriginalName();

            $thumbDir = storage_path('app/public/artworks/thumbnails');
            if (!file_exists($thumbDir)) {
                mkdir($thumbDir, 0755, true);
            }

            $thumbManager = new ImageManager(GdDriver::class);
            $thumbImage = $thumbManager
                ->decodePath($thumb->getRealPath())
                ->resize(400, 300);

            $thumbImage
                ->encodeUsingFileExtension('jpg', 80)
                ->save($thumbDir . DIRECTORY_SEPARATOR . $thumbName);
            $thumbnailPath = 'artworks/thumbnails/' . $thumbName;
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

        return response()->json([
            'message' => 'Karya berhasil diupload, menunggu verifikasi.',
            'artwork' => $artwork
        ], 201);
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

        return response()->json([
            'message' => 'Karya berhasil diupdate.',
            'artwork' => $artwork
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $user = $request->user();

        if ($artwork->id_user !== $user->id_user && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filePath = storage_path('app/public/' . $artwork->file_path);
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        if ($artwork->thumbnail) {
            $thumbPath = storage_path('app/public/' . $artwork->thumbnail);
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }
        }

        $artwork->delete();

        return response()->json(['message' => 'Karya berhasil dihapus.']);
    }
}
