<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    protected $primaryKey = 'id_mk';
    public $timestamps = false;
    protected $fillable = ['id_prodi', 'kode_mk', 'nama_mk', 'sks'];

    public function programStudi()    { return $this->belongsTo(ProgramStudi::class, 'id_prodi', 'id_prodi'); }
    public function detailKurikulum() { return $this->hasMany(DetailKurikulum::class, 'id_mk', 'id_mk'); }
}
