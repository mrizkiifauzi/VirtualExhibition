<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_user', 'id_prodi', 'judul', 'deskripsi',
        'tipe', 'file_path', 'thumbnail', 'status', 'posisi_3d',
    ];

    protected $casts = ['posisi_3d' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function programStudi()
    {
        return $this->belongsTo(ProgramStudi::class, 'id_prodi', 'id_prodi');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'artwork_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'artwork_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'artwork_id');
    }
}
