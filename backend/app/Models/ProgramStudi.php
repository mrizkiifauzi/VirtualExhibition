<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramStudi extends Model
{
    protected $table = 'program_studi';
    protected $primaryKey = 'id_prodi';
    public $timestamps = false;
    protected $fillable = ['nama_prodi', 'jenjang'];

    public function users()
    {
        return $this->hasMany(User::class, 'id_prodi', 'id_prodi');
    }
    public function artworks()
    {
        return $this->hasMany(Artwork::class, 'id_prodi', 'id_prodi');
    }
    public function kurikulum()
    {
        return $this->hasMany(Kurikulum::class, 'id_prodi', 'id_prodi');
    }
}
