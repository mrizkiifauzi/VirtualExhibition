<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = ['id_user', 'artwork_id', 'nilai'];

    public function user()    { return $this->belongsTo(User::class, 'id_user', 'id_user'); }
    public function artwork() { return $this->belongsTo(Artwork::class); }
}
