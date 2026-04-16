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
            if ($user->foto_profil) {
                Storage::disk('public')->delete($user->foto_profil);
            }
            $data['foto_profil'] = $request->file('foto_profil')->store('profiles', 'public');
        }

        $user->update($data);

        return response()->json(['message' => 'Profil berhasil diupdate.', 'user' => $user->load('programStudi')]);
    }
}
