<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    protected $fillable = ['id_user', 'artwork_id'];
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->created_at = now();
        });
    }

    public function user()    { return $this->belongsTo(User::class, 'id_user', 'id_user'); }
    public function artwork() { return $this->belongsTo(Artwork::class); }
}
