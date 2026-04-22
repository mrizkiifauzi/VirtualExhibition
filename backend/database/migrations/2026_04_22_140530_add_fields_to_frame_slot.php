<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('frame_slot', function (Blueprint $table) {
            $table->id('slot_id');

            $table->unsignedBigInteger('id_artwork')->nullable();

            $table->float('posisi_x')->nullable();
            $table->float('posisi_y')->nullable();
            $table->float('posisi_z')->nullable();

            $table->timestamps();

            $table->foreign('id_artwork')
                ->references('id')
                ->on('artworks')
                ->nullOnDelete(); // slot tetap ada walau artwork dihapus
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frame_slot');
    }
};
