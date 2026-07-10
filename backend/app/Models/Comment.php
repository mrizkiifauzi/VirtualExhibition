<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = ['id_user', 'artwork_id', 'isi'];

    const UPDATED_AT = null;

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
    public function artwork()
    {
        return $this->belongsTo(Artwork::class);
    }
}
