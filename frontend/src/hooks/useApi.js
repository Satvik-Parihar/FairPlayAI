
// import axios from 'axios';
// // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BASE_URL = "http://127.0.0.1:8000/api"; // ✅ not /api/analysis


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
//   // Auth endpoints
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

//   // File upload endpoint
//   const uploadFiles = async (formData) => {
//     const response = await api.post('/analysis/upload', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   };

//   // Analysis endpoints
//   const getAnalysis = async (analysisId) => {
//     const response = await api.get(`/analysis/${analysisId}`);
//     return response.data;
//   };

//   const getAnalysisHistory = async () => {
//     const response = await api.get('/analysis/history');
//     return response.data;
//   };

//   const deleteAnalysis = async (analysisId) => {
//     const response = await api.delete(`/analysis/${analysisId}`);
//     return response.data;
//   };

//   // Export endpoints
//   const exportReport = async (analysisId, format = 'pdf') => {
//     const response = await api.get(`/analysis/${analysisId}/export`, {
//       params: { format },
//       responseType: 'blob',
//     });
//     return response.data;
//   };

//   return {
//     login,
//     logout,
//     uploadFiles,
//     getAnalysis,
//     getAnalysisHistory,
//     deleteAnalysis,
//     exportReport,
//   };
// };
import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000/api/fairness/";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useApi = () => {
  // Auth endpoints (keep existing)
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  // New analysis endpoints
  const uploadAndAnalyze = async (formData) => {
    try {
      const response = await api.post('/upload_and_analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getReport = async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Keep existing endpoints for future use
  const getAnalysisHistory = async () => {
    const response = await api.get('/analysis/history');
    return response.data;
  };

  const deleteAnalysis = async (analysisId) => {
    const response = await api.delete(`/analysis/${analysisId}`);
    return response.data;
  };

  const exportReport = async (analysisId, format = 'pdf') => {
    const response = await api.get(`/analysis/${analysisId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  };

  return {
    // Auth functions
    login,
    logout,
    
    // Analysis functions
    uploadAndAnalyze,
    getReport,
    
    // Future functions
    getAnalysisHistory,
    deleteAnalysis,
    exportReport,
  };
};