<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\ProgramStudi;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed 6 Program Studi
        $prodis = [
            ['nama_prodi' => 'Teknik Informatika',        'jenjang' => 'S1'],
            ['nama_prodi' => 'Sistem Informasi',          'jenjang' => 'S1'],
            ['nama_prodi' => 'Desain Komunikasi Visual',  'jenjang' => 'S1'],
            ['nama_prodi' => 'Desain Produk',             'jenjang' => 'S1'],
            ['nama_prodi' => 'Animasi',                   'jenjang' => 'D4'],
            ['nama_prodi' => 'Rekayasa Perangkat Lunak',  'jenjang' => 'D4'],
        ];
        foreach ($prodis as $prodi) {
            ProgramStudi::firstOrCreate(['nama_prodi' => $prodi['nama_prodi']], $prodi);
        }

        // Admin
        User::firstOrCreate(['email' => 'admin@exhibition.id'], [
            'name'     => 'Administrator',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
        ]);

        // Demo mahasiswa
        $prodi1 = ProgramStudi::where('nama_prodi', 'Teknik Informatika')->first();
        User::firstOrCreate(['email' => 'mahasiswa@exhibition.id'], [
            'name'     => 'Budi Santoso',
            'password' => Hash::make('password123'),
            'role'     => 'mahasiswa',
            'nim'      => '2021001001',
            'id_prodi' => $prodi1->id_prodi,
        ]);

        // Demo pengunjung
        User::firstOrCreate(['email' => 'pengunjung@exhibition.id'], [
            'name'     => 'Siti Rahayu',
            'password' => Hash::make('password123'),
            'role'     => 'pengunjung',
        ]);
    }
}
