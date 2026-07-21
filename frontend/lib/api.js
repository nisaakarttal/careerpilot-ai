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

export async function deleteResume(resumeId) {
  try {
    const response = await apiClient.delete(`/resume/${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}


export async function createJobPost({ title, company, description }) {
  try {
    const response = await apiClient.post("/jobs", {
      title,
      company,
      description,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function listJobPosts() {
  try {
    const response = await apiClient.get("/jobs");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function matchResumeToJob(jobId, resumeId) {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/match/${resumeId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getJobMatches(jobId) {
  try {
    const response = await apiClient.get(`/jobs/${jobId}/matches`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function startChatSession(resumeId, assistantType = "interview") {
  try {
    const response = await apiClient.post("/chat/sessions", {
      resume_id: resumeId,
      assistant_type: assistantType,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function listChatSessions({
  resumeId,
  assistantType,
  status,
} = {}) {
  try {
    const response = await apiClient.get("/chat/sessions", {
      params: {
        resume_id: resumeId,
        assistant_type: assistantType,
        status,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function completeChatSession(sessionId) {
  try {
    const response = await apiClient.post(`/chat/sessions/${sessionId}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function deleteChatSession(sessionId) {
  try {
    await apiClient.delete(`/chat/sessions/${sessionId}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export function getChatWebSocketUrl(sessionId, token) {
  if (typeof window === "undefined") return "";

  const url = new URL(API_BASE_URL, window.location.origin);
  const apiPath = url.pathname.replace(/\/$/, "");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${apiPath}/chat/ws/${sessionId}`;
  url.search = "";
  url.searchParams.set("token", token);
  return url.toString();
}

export async function getSessionMessages(sessionId) {
  try {
    const response = await apiClient.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function sendChatMessage(sessionId, content) {
  try {
    const response = await apiClient.post(`/chat/sessions/${sessionId}/message`, {
      content,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getMyProfile() {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function updateMyProfile(payload) {
  try {
    const response = await apiClient.put("/auth/me", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export default apiClient;
