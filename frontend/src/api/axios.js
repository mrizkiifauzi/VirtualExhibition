import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  // Hapus 'Content-Type' default agar Axios bisa otomatis
  // menentukan boundary saat mengirim FormData (upload foto)
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, // Pastikan tidak mengirim cookie session Laravel
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401: Unauthorized (Token expired/invalid)
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Gunakan replace agar user tidak bisa 'Back' ke halaman proteksi
      window.location.replace("/login");
    }

    // 419: Session Expired / CSRF Error
    // Jika masih muncul, ini biasanya karena cache route di Laravel
    if (err.response?.status === 419) {
      console.error("CSRF/419 Error: Pastikan route berada di api.php");
    }

    return Promise.reject(err);
  },
);

export default api;
