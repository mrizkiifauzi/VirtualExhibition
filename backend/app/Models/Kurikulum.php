<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kurikulum extends Model
{
    protected $primaryKey = 'id_kurikulum';
    public $timestamps = false;
    protected $fillable = ['id_prodi', 'tahun_kurikulum', 'deskripsi'];

    public function programStudi()    { return $this->belongsTo(ProgramStudi::class, 'id_prodi', 'id_prodi'); }
    public function detailKurikulum() { return $this->hasMany(DetailKurikulum::class, 'id_kurikulum', 'id_kurikulum'); }
}
