<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DetailKurikulum extends Model
{
    protected $primaryKey = 'id_detail';
    public $timestamps = false;
    protected $fillable = ['id_mk', 'id_kurikulum', 'semester'];

    public function mataKuliah() { return $this->belongsTo(MataKuliah::class, 'id_mk', 'id_mk'); }
    public function kurikulum()  { return $this->belongsTo(Kurikulum::class, 'id_kurikulum', 'id_kurikulum'); }
}
