import axios from "axios";
import { getToken, clearToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

function extractErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export async function registerUser({ email, fullName, password }) {
  try {
    const response = await apiClient.post("/auth/register", {
      email,
      full_name: fullName,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function uploadResume(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getDashboard() {
  try {
    const response = await apiClient.get("/resume/dashboard");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getResumeById(resumeId) {
  try {
    const response = await apiClient.get(`/resume/${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export default apiClient;
