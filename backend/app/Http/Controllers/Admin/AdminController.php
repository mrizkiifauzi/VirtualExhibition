<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_artworks'  => Artwork::count(),
            'pending'         => Artwork::where('status', 'pending')->count(),
            'verified'        => Artwork::where('status', 'verified')->count(),
            'rejected'        => Artwork::where('status', 'rejected')->count(),
            'total_users'     => User::count(),
            'total_mahasiswa' => User::where('role', 'mahasiswa')->count(),
        ]);
    }

    public function artworks(Request $request)
    {
        $query = Artwork::with(['user:id_user,name,nim', 'programStudi:id_prodi,nama_prodi'])
                        ->withCount(['likes', 'comments'])
                        ->withAvg('ratings', 'nilai');

        if ($request->status) $query->where('status', $request->status);
        if ($request->search) $query->where('judul', 'like', '%' . $request->search . '%');

        return response()->json($query->latest()->paginate(15));
    }

    public function verify($id)
    {
        $artwork = Artwork::findOrFail($id);
        $artwork->update(['status' => 'verified']);
        return response()->json(['message' => 'Karya berhasil diverifikasi.', 'artwork' => $artwork]);
    }

    public function reject(Request $request, $id)
    {
        $artwork = Artwork::findOrFail($id);
        $artwork->update(['status' => 'rejected']);
        return response()->json(['message' => 'Karya telah ditolak.', 'artwork' => $artwork]);
    }

    public function setPosition(Request $request, $id)
    {
        $request->validate([
            'posisi_3d' => 'required|array',
            'posisi_3d.x' => 'required|numeric',
            'posisi_3d.y' => 'required|numeric',
            'posisi_3d.z' => 'required|numeric',
            'posisi_3d.rotation' => 'nullable|numeric',
        ]);

        $artwork = Artwork::findOrFail($id);
        $artwork->update(['posisi_3d' => $request->posisi_3d]);

        return response()->json(['message' => 'Posisi 3D berhasil diset.', 'artwork' => $artwork]);
    }

    public function deleteArtwork($id)
    {
        $artwork = Artwork::findOrFail($id);
        Storage::disk('public')->delete($artwork->file_path);
        if ($artwork->thumbnail) Storage::disk('public')->delete($artwork->thumbnail);
        $artwork->delete();

        return response()->json(['message' => 'Karya berhasil dihapus.']);
    }

    public function users(Request $request)
    {
        $query = User::with('programStudi:id_prodi,nama_prodi')
                     ->withCount('artworks');

        if ($request->role)   $query->where('role', $request->role);
        if ($request->search) $query->where('name', 'like', '%' . $request->search . '%');

        return response()->json($query->latest()->paginate(15));
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:pengunjung,mahasiswa,admin']);
        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json(['message' => 'Role user berhasil diubah.', 'user' => $user]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Tidak bisa menghapus akun admin.'], 403);
        }
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
