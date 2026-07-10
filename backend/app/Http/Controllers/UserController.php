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
            'nim'        => 'nullable|string|max:20|unique:users,nim,' . $request->user()->id_user . ',id_user',
            'id_prodi'   => 'nullable|exists:program_studi,id_prodi',
        ]);

        $user = $request->user();
        $data = $request->only(['name', 'nim', 'id_prodi']);

        $user->update($data);

        return response()->json(['message' => 'Profil berhasil diupdate.', 'user' => $user->load('programStudi')]);
    }
}
