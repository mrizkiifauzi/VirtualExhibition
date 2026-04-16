import { useState, useEffect } from 'react'
import Navbar from '../components/common/Navbar'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/storage'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [prodis, setProdis] = useState([])
  const [tab, setTab] = useState('profile') // 'profile' | 'password'

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', nim: user?.nim || '', id_prodi: user?.id_prodi || '',
  })
  const [passForm, setPassForm] = useState({
    current_password: '', password: '', password_confirmation: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passLoading, setPassLoading]       = useState(false)
  const [profileErrors, setProfileErrors]   = useState({})
  const [passErrors, setPassErrors]         = useState({})
  const [avatarPreview, setAvatarPreview]   = useState(
    user?.foto_profil ? `${API_URL}/${user.foto_profil}` : null
  )
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => { api.get('/program-studi').then(({ data }) => setProdis(data)) }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

 const submitProfile = async (e) => {
  e.preventDefault()
  setProfileErrors({})
  setProfileLoading(true)
  
  try {
    const fd = new FormData()
    fd.append('name', profileForm.name)
    fd.append('nim', profileForm.nim || '')
    fd.append('id_prodi', profileForm.id_prodi || '')
    
    // Kirim method spoofing karena PHP tidak support PUT untuk file upload secara native
    fd.append('_method', 'PUT') 

    if (avatarFile) fd.append('foto_profil', avatarFile)

    // Ganti api.put menjadi api.post
    const { data } = await api.post('/user', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    updateUser(data.user)
    toast.success('Profil berhasil diperbarui!')
  } catch (err) {
    if (err.response?.data?.errors) setProfileErrors(err.response.data.errors)
    else toast.error(err.response?.data?.message || 'Gagal memperbarui profil')
  } finally {
    setProfileLoading(false)
  }
}

  const submitPassword = async (e) => {
    e.preventDefault()
    setPassErrors({})
    setPassLoading(true)
    try {
      await api.put('/user/password', passForm)
      toast.success('Password berhasil diubah!')
      setPassForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      if (err.response?.data?.errors) setPassErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Pengaturan Akun</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8">
          {[['profile', '👤 Profil'], ['password', '🔐 Ganti Password']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-primary-600 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card p-8">
            <form onSubmit={submitProfile} className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary-600 rounded-2xl overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                    <span className="text-xs text-white">✏️</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-white/40 capitalize">{user?.role}</p>
                  <p className="text-xs text-white/30 mt-1">Klik ikon pensil untuk ganti foto</p>
                </div>
              </div>

              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="input" placeholder="Nama lengkap" required
                />
                {profileErrors.name && <p className="text-red-400 text-xs mt-1">{profileErrors.name[0]}</p>}
              </div>

              <div>
                <label className="label">Email</label>
                <input value={user?.email} className="input opacity-50" disabled />
                <p className="text-xs text-white/30 mt-1">Email tidak dapat diubah</p>
              </div>

              {user?.role === 'mahasiswa' && (
                <>
                  <div>
                    <label className="label">NIM</label>
                    <input
                      value={profileForm.nim}
                      onChange={e => setProfileForm({ ...profileForm, nim: e.target.value })}
                      className="input" placeholder="Nomor Induk Mahasiswa"
                    />
                  </div>
                  <div>
                    <label className="label">Program Studi</label>
                    <select
                      value={profileForm.id_prodi}
                      onChange={e => setProfileForm({ ...profileForm, id_prodi: e.target.value })}
                      className="input"
                    >
                      <option value="">Pilih Program Studi</option>
                      {prodis.map(p => (
                        <option key={p.id_prodi} value={p.id_prodi}>{p.nama_prodi} ({p.jenjang})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button type="submit" disabled={profileLoading} className="btn-primary w-full py-3">
                {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="card p-8">
            <form onSubmit={submitPassword} className="space-y-5">
              <div>
                <label className="label">Password Saat Ini</label>
                <input
                  type="password"
                  value={passForm.current_password}
                  onChange={e => setPassForm({ ...passForm, current_password: e.target.value })}
                  className="input" placeholder="••••••••" required
                />
                {passErrors.current_password && (
                  <p className="text-red-400 text-xs mt-1">{passErrors.current_password[0]}</p>
                )}
              </div>

              <div>
                <label className="label">Password Baru</label>
                <input
                  type="password"
                  value={passForm.password}
                  onChange={e => setPassForm({ ...passForm, password: e.target.value })}
                  className="input" placeholder="Min. 8 karakter" required
                />
                {passErrors.password && <p className="text-red-400 text-xs mt-1">{passErrors.password[0]}</p>}
              </div>

              <div>
                <label className="label">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={passForm.password_confirmation}
                  onChange={e => setPassForm({ ...passForm, password_confirmation: e.target.value })}
                  className="input" placeholder="Ulangi password baru" required
                />
              </div>

              <button type="submit" disabled={passLoading} className="btn-primary w-full py-3">
                {passLoading ? 'Memproses...' : 'Ubah Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
