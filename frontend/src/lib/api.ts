import axios from "axios";

// ✅ Create Axios instance
export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

// ✅ Automatically attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ POST helper
export async function apiPost(url: string, data: any, options = {}) {
  const res = await api.post(url, data, options);
  return res.data;
}

// ✅ GET helper
export async function apiGet(url: string, options = {}) {
  const res = await api.get(url, options);
  return res.data;
}
