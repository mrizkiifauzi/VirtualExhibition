<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('program_studi', function (Blueprint $table) {
            $table->bigIncrements('id_prodi');
            $table->string('nama_prodi');
            $table->enum('jenjang', ['D3', 'D4', 'S1', 'S2']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('id_prodi')->references('id_prodi')->on('program_studi')->nullOnDelete();
        });
    }
    public function down(): void { Schema::dropIfExists('program_studi'); }
};
