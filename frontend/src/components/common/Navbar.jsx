import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {}
    logout();
    toast.success("Berhasil logout");
    navigate("/Login");
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isActive(to)
          ? "bg-primary-600 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-gray-950/80 backdrop-blur-md border-white/10">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="hidden font-bold text-white sm:block">
            Virtual Exhibition
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="items-center hidden gap-1 md:flex">
          {navLink("/", "Beranda")}
          {navLink("/gallery", "Galeri")}
          {navLink("/exhibition", "Pameran 3D")}
          {user?.role === "mahasiswa" && navLink("/upload", "Upload Karya")}
          {user?.role === "admin" && navLink("/admin", "Admin Panel")}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1.5 transition-all"
              >
                <div className="flex items-center justify-center text-xs font-bold text-white rounded-full w-7 h-7 bg-primary-600">
                  {/* PERBAIKAN: Gunakan optional chaining dan fallback string */}
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                {/* PERBAIKAN: Gunakan optional chaining */}
                <span className="text-sm text-white hidden sm:block max-w-[120px] truncate">
                  {user?.name}
                </span>
                <svg
                  className="w-4 h-4 text-white/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {dropOpen && (
                <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-gray-900 border shadow-2xl border-white/10 rounded-xl">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs capitalize text-white/40">
                      {user?.role}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm transition-all text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm transition-all text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <span>👤</span> Profil & Password
                  </Link>
                  {user?.role === "mahasiswa" && (
                    <Link
                      to="/upload"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-all text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <span>📤</span> Upload Karya
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-all text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <span>⚙️</span> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-red-400 transition-all hover:text-red-300 hover:bg-white/10"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-primary text-sm py-1.5 px-4">
                Masuk
              </Link>
              {/* <Link to="/register" className="btn-primary  text-sm py-1.5 px-4">Daftar</Link> */}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-white md:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="flex flex-col gap-1 px-4 py-3 border-t md:hidden bg-gray-950/95 border-white/10">
          {navLink("/", "Beranda")}
          {navLink("/gallery", "Galeri")}
          {navLink("/exhibition", "Pameran 3D")}
          {user?.role === "mahasiswa" && navLink("/upload", "Upload Karya")}
          {user?.role === "admin" && navLink("/admin", "Admin Panel")}
        </div>
      )}
    </nav>
  );
}
