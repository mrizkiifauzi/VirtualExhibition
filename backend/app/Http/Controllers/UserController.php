<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        return response()->json($request->user()->load('programStudi'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'name'       => 'sometimes|string|max:255',
            'nim'        => 'nullable|string|max:20',
            'id_prodi'   => 'nullable|exists:program_studi,id_prodi',
            'foto_profil'=> 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = $request->user();
        $data = $request->only(['name', 'nim', 'id_prodi']);

        if ($request->hasFile('foto_profil')) {
            // Hapus file lama jika ada
            if ($user->foto_profil) {
                $oldPath = public_path($user->foto_profil);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            // Upload file baru ke public/profiles
            $foto = $request->file('foto_profil');
            $fotoName = time() . '_' . $foto->getClientOriginalName();

            $fotoDir = public_path('profiles');
            if (!file_exists($fotoDir)) {
                mkdir($fotoDir, 0755, true);
            }

            $foto->move($fotoDir, $fotoName);
            $data['foto_profil'] = 'profiles/' . $fotoName;
        }

        $user->update($data);

        return response()->json(['message' => 'Profil berhasil diupdate.', 'user' => $user->load('programStudi')]);
    }
}
