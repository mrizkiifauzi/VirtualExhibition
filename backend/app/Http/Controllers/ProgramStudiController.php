<?php

namespace App\Http\Controllers;

use App\Models\ProgramStudi;
use Illuminate\Http\Request;

class ProgramStudiController extends Controller
{
    public function index()
    {
        $prodi = ProgramStudi::withCount(['artworks' => function($q){
            $q->where('status','verified');
        }])->get();

        return response()->json($prodi);
    }
}
