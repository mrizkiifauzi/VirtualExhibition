import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const JENJANG = ["D3", "D4", "S1", "S2"];

export default function ManagePrograms() {
  const [prodis, setProdis] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: "add", prodi: null });
  const [form, setForm] = useState({ nama_prodi: "", jenjang: "D3" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") || 1;

  const loadProdi = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page);

    api
      .get(`/admin/program-studi?${params}`)
      .then(({ data }) => {
        setProdis(data.data || []);
        setMeta(data.meta || data);
      })
      .catch(() => toast.error("Gagal memuat data program studi"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProdi();
  }, [page]);

  const setPage = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    if (pageNumber > 1) params.set("page", pageNumber);
    else params.delete("page");
    setSearchParams(params);
  };

  const openAddModal = () => {
    setForm({ nama_prodi: "", jenjang: "D3" });
    setModal({ open: true, mode: "add", prodi: null });
  };

  const openEditModal = (prodi) => {
    setForm({ nama_prodi: prodi.nama_prodi, jenjang: prodi.jenjang });
    setModal({ open: true, mode: "edit", prodi });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add", prodi: null });
    setForm({ nama_prodi: "", jenjang: "D3" });
  };

  const submitForm = async () => {
    if (!form.nama_prodi.trim()) {
      return toast.error("Nama prodi harus diisi");
    }

    setSubmitting(true);
    try {
      if (modal.mode === "add") {
        const { data } = await api.post("/admin/program-studi", form);
        setProdis((prev) => [...prev, data.data]);
        toast.success("Program studi berhasil ditambahkan");
      } else {
        const { data } = await api.put(
          `/admin/program-studi/${modal.prodi.id_prodi}`,
          form,
        );
        setProdis((prev) =>
          prev.map((item) =>
            item.id_prodi === modal.prodi.id_prodi ? data.data : item,
          ),
        );
        toast.success("Program studi berhasil diperbarui");
      }
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan program studi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (prodi) => {
    setDeleteTarget(prodi);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const deleteProdi = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/program-studi/${deleteTarget.id_prodi}`);
      setProdis((prev) =>
        prev.filter((item) => item.id_prodi !== deleteTarget.id_prodi),
      );
      toast.success("Program studi berhasil dihapus");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menghapus program studi",
      );
    } finally {
      cancelDelete();
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-950">
      <Navbar />
      <div className="px-4 py-10 mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-sm text-white/40 hover:text-white">
            ← Admin Panel
          </Link>
          <h1 className="text-2xl font-bold text-white">Kelola Prodi</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-6 mb-6 card">
          <div>
            <p className="text-sm text-white/60">
              Perubahan di sini akan mempengaruhi karya dan pengguna yang
              memakai prodi terkait.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-sm btn-primary"
          >
            + Tambah Prodi
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-24 card animate-pulse" />
            ))}
          </div>
        ) : prodis.length === 0 ? (
          <div className="p-12 text-center card">
            <span className="block mb-3 text-4xl">🎓</span>
            <p className="text-white/50">Belum ada prodi terdaftar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prodis.map((prodi) => (
              <div
                key={prodi.id_prodi}
                className="flex flex-col gap-4 p-4 card md:flex-row md:items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {prodi.nama_prodi}
                    </h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70">
                      {prodi.jenjang}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openEditModal(prodi)}
                    className="px-4 py-2 text-sm btn-secondary"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(prodi)}
                    className="px-4 py-2 text-sm btn-danger"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta?.last_page > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {[...Array(meta.last_page)].map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  meta.current_page === index + 1
                    ? "bg-primary-600 text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg overflow-hidden border shadow-2xl rounded-3xl bg-slate-950 border-slate-700">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {modal.mode === "add" ? "Tambah Prodi" : "Edit Prodi"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Nama Prodi</label>
                <input
                  className="input"
                  value={form.nama_prodi}
                  onChange={(e) =>
                    setForm({ ...form, nama_prodi: e.target.value })
                  }
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>
              <div>
                <label className="label">Jenjang</label>
                <select
                  className="input"
                  value={form.jenjang}
                  onChange={(e) =>
                    setForm({ ...form, jenjang: e.target.value })
                  }
                >
                  {JENJANG.map((item) => (
                    <option key={item} value={item} className="text-black">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-950">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm border rounded-2xl border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitForm}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white transition rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Menyimpan..."
                  : modal.mode === "add"
                    ? "Tambah Prodi"
                    : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md overflow-hidden border shadow-2xl rounded-3xl bg-slate-950 border-slate-700">
            <div className="px-6 py-5 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Hapus Prodi</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-white/70">
                Yakin ingin menghapus prodi{" "}
                <strong>{deleteTarget.nama_prodi}</strong>?
              </p>
              {/* <p className="text-sm text-white/40">
                Tindakan ini akan menghapus entri dari tabel{" "}
                <code>program_studi</code> dan tidak akan otomatis mengubah data
                lainnya.
              </p> */}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-950">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 text-sm border rounded-2xl border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={deleteProdi}
                className="px-4 py-2 text-sm font-semibold text-white transition bg-red-600 rounded-2xl hover:bg-red-700"
              >
                Hapus Prodi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
