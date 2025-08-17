// src/axios.js
import axios from "axios";

// Prefer runtime var injected by env.sh, fall back to build-time, then localhost
const apiBase =
  (window._env_ && window._env_.API_URL) ||
  process.env.REACT_APP_API ||
  "http://localhost:5000";

const instance = axios.create({
  baseURL: apiBase,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default instance;
