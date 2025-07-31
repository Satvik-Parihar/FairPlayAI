// // import axios from 'axios';
// // // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// // const BASE_URL = "http://127.0.0.1:8000/api"; // ✅ not /api/analysis

// // // Create axios instance with base configuration
// // const api = axios.create({
// //   baseURL: BASE_URL,
// //   timeout: 30000,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Request interceptor to add auth token
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('auth_token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor for error handling
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       localStorage.removeItem('auth_token');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export const useApi = () => {
// //   // Auth endpoints
// //   const login = async (email, password) => {
// //     const response = await api.post('/auth/login', { email, password });
// //     if (response.data.token) {
// //       localStorage.setItem('auth_token', response.data.token);
// //     }
// //     return response.data;
// //   };

// //   const logout = () => {
// //     localStorage.removeItem('auth_token');
// //     window.location.href = '/login';
// //   };

// //   // File upload endpoint
// //   const uploadFiles = async (formData) => {
// //     const response = await api.post('/analysis/upload', formData, {
// //       headers: {
// //         'Content-Type': 'multipart/form-data',
// //       },
// //     });
// //     return response.data;
// //   };

// //   // Analysis endpoints
// //   const getAnalysis = async (analysisId) => {
// //     const response = await api.get(`/analysis/${analysisId}`);
// //     return response.data;
// //   };

// //   const getAnalysisHistory = async () => {
// //     const response = await api.get('/analysis/history');
// //     return response.data;
// //   };

// //   const deleteAnalysis = async (analysisId) => {
// //     const response = await api.delete(`/analysis/${analysisId}`);
// //     return response.data;
// //   };

// //   // Export endpoints
// //   const exportReport = async (analysisId, format = 'pdf') => {
// //     const response = await api.get(`/analysis/${analysisId}/export`, {
// //       params: { format },
// //       responseType: 'blob',
// //     });
// //     return response.data;
// //   };

// //   return {
// //     login,
// //     logout,
// //     uploadFiles,
// //     getAnalysis,
// //     getAnalysisHistory,
// //     deleteAnalysis,
// //     exportReport,
// //   };
// // };
// import axios from 'axios';

// const BASE_URL = "http://127.0.0.1:8000/api/fairness/";

// // Create axios instance with base configuration
// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('auth_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('auth_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export const useApi = () => {
//   // Auth endpoints (keep existing)
//   const login = async (email, password) => {
//     const response = await api.post('/auth/login', { email, password });
//     if (response.data.token) {
//       localStorage.setItem('auth_token', response.data.token);
//     }
//     return response.data;
//   };

//   const logout = () => {
//     localStorage.removeItem('auth_token');
//     window.location.href = '/login';
//   };

//   // New analysis endpoints
//   const uploadAndAnalyze = async (formData) => {
//     try {
//       const response = await api.post('/upload_and_analyze/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const getReport = async (reportId) => {
//     try {
//       const response = await api.get(`/reports/${reportId}/`);
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const getCleaningStats = async (reportId) => {
//     // New cleaning endpoint
//     try {
//       const response = await api.get(`/clean-data/${reportId}/`);
//       return response.data;
//     } catch (error) {
//       console.error("Failed to fetch cleaning stats:", error);
//       throw error;
//     }
//   };

//   const applyCleaningChoices = async (reportId, cleaningChoices) => {
//     // New cleaning endpoint
//     try {
//       const response = await api.post(`/clean-data/${reportId}/`, {
//         cleaning_choices: cleaningChoices,
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Failed to apply cleaning choices:", error);
//       throw error;
//     }
//   };

//   // Keep existing endpoints for future use
//   const getAnalysisHistory = async () => {
//     const response = await api.get('/analysis/history');
//     return response.data;
//   };

//   const deleteAnalysis = async (analysisId) => {
//     const response = await api.delete(`/analysis/${analysisId}`);
//     return response.data;
//   };

//   const exportReport = async (analysisId, format = 'pdf') => {
//     const response = await api.get(`/analysis/${analysisId}/export`, {
//       params: { format },
//       responseType: 'blob',
//     });
//     return response.data;
//   };

//   return {
//     // Auth functions
//     login,
//     logout,

//     // Analysis and Cleaning functions
//     uploadAndAnalyze,
//     getReport,
//     getCleaningStats, // Added
//     applyCleaningChoices, // Added

//     // Future functions
//     getAnalysisHistory,
//     deleteAnalysis,
//     exportReport,
//   };
// };
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/fairness/"; // Ensure this matches your Django API URL

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh access token using refresh token
const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const response = await api.post("/auth/token/refresh/", { refresh });
    if (response.data.access) {
      localStorage.setItem("auth_token", response.data.access);
      return response.data.access;
    }
    return null;
  } catch (error) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    return null;
  }
};

// Response interceptor for error handling and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const useApi = () => {
  // Login: store both access and refresh tokens
  const login = async (email, password) => {
    const response = await api.post("/auth/login/", { email, password });
    if (response.data.access) {
      localStorage.setItem("auth_token", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  // Analysis and Cleaning endpoints
  const uploadAndAnalyze = async (formData, onUploadProgress) => {
    // Added onUploadProgress
    try {
      const response = await api.post("/upload-csv/", formData, {
        // Corrected endpoint to match views.py
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          // Re-added progress tracking
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error("Upload and analyze failed:", error); // Added console error for debugging
      throw error;
    }
  };

  const getReport = async (reportId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`/api/fairness/reports/${reportId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Failed to get report:", error);
      throw error;
    }
  };

  const getCleaningStats = async (reportId) => {
    // New cleaning endpoint
    try {
      const response = await api.get(`/clean-data/${reportId}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch cleaning stats:", error);
      throw error;
    }
  };

  const applyCleaningChoices = async (reportId, cleaningChoices) => {
    // New cleaning endpoint
    try {
      const response = await api.post(`/clean-data/${reportId}/`, {
        cleaning_choices: cleaningChoices,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to apply cleaning choices:", error);
      throw error;
    }
  };

  // Keep existing endpoints for future use
  const getAnalysisHistory = async () => {
    const response = await api.get("/analysis/history"); // Assuming this endpoint is correct
    return response.data;
  };

  const deleteAnalysis = async (analysisId) => {
    const response = await api.delete(`/analysis/${analysisId}`); // Assuming this endpoint is correct
    return response.data;
  };

  const exportReport = async (analysisId, format = "pdf") => {
    const response = await api.get(`/analysis/${analysisId}/export`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  };

  return {
    // Auth functions
    login,
    logout,

    // Analysis and Cleaning functions
    uploadAndAnalyze,
    getReport,
    getCleaningStats, // Added
    applyCleaningChoices, // Added

    // Future functions
    getAnalysisHistory,
    deleteAnalysis,
    exportReport,
  };
};
