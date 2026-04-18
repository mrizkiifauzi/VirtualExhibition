import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, // pakai token, bukan session
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR (Attach Token)
|--------------------------------------------------------------------------
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ❗ PENTING: Jangan set Content-Type manual kalau FormData
    // Axios akan otomatis set boundary

    return config;
  },
  (error) => Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR (Handle Error)
|--------------------------------------------------------------------------
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token invalid / expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.replace("/login");
    }

    if (status === 419) {
      console.error("CSRF / 419 Error: Pastikan pakai api.php, bukan web.php");
    }

    if (status === 500) {
      console.error("Server Error:", error.response?.data);
    }

    return Promise.reject(error);
  },
);

export default api;
