<?php

namespace App\Http\Controllers;

use App\Models\ProgramStudi;
use Illuminate\Http\Request;

class ProgramStudiController extends Controller
{
    public function index()
    {
        $prodi = ProgramStudi::withCount(['artworks' => function ($q) {
            $q->where('status', 'verified');
        }])->orderBy('nama_prodi')->get();

        return response()->json($prodi);
    }

    public function adminIndex(Request $request)
    {
        $prodi = ProgramStudi::withCount(['artworks' => function ($q) {
            $q->where('status', 'verified');
        }])->orderBy('nama_prodi')->paginate(10);

        return response()->json($prodi);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_prodi' => 'required|string|max:255|unique:program_studi,nama_prodi',
            'jenjang'    => 'required|in:D3,D4,S1,S2',
        ]);

        $prodi = ProgramStudi::create($request->only(['nama_prodi', 'jenjang']));

        return response()->json(['message' => 'Program studi berhasil dibuat.', 'data' => $prodi], 201);
    }

    public function update(Request $request, $id)
    {
        $prodi = ProgramStudi::findOrFail($id);

        $request->validate([
            'nama_prodi' => 'required|string|max:255|unique:program_studi,nama_prodi,' . $prodi->id_prodi . ',id_prodi',
            'jenjang'    => 'required|in:D3,D4,S1,S2',
        ]);

        $prodi->update($request->only(['nama_prodi', 'jenjang']));

        return response()->json(['message' => 'Program studi berhasil diperbarui.', 'data' => $prodi]);
    }

    public function destroy($id)
    {
        $prodi = ProgramStudi::findOrFail($id);
        $prodi->delete();

        return response()->json(['message' => 'Program studi berhasil dihapus.']);
    }
}
