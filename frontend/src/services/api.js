import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cv_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let Axios & browser set boundary header automatically for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('cv_refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post('/api/auth/refresh', { token: refreshToken });

        localStorage.setItem('cv_access_token', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('cv_access_token');
        localStorage.removeItem('cv_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (data) => api.post('/auth/refresh', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, status, data) => api.put(`/complaints/${id}/status`, { status, ...data }),
  reply: (id, data) => api.post(`/complaints/${id}/replies`, data),
  resolve: (id, data) => api.post(`/complaints/${id}/resolve`, data),
  reject: (id, data) => api.post(`/complaints/${id}/reject`, data),
  escalate: (id, data) => api.post(`/complaints/${id}/escalate`, data),
  reopen: (id, data) => api.post(`/complaints/${id}/reopen`, data),
  follow: (id) => api.post(`/complaints/${id}/follow`),
  getTimeline: (id) => api.get(`/complaints/${id}/timeline`),
  checkDuplicates: (data) => api.post('/complaints/check-duplicates', data),
  getAISuggestions: (text) => api.post('/complaints/ai-suggestions', { text }),
};

export const feedbackAPI = {
  create: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  review: (id, data) => api.post(`/feedback/${id}/review`, data),
  getAnalytics: (params) => api.get('/feedback/analytics', { params }),
};

export const academicReviewAPI = {
  create: (data) => api.post('/academic-reviews', data),
  getAll: (params) => api.get('/academic-reviews', { params }),
  getById: (id) => api.get(`/academic-reviews/${id}`),
  submitFacultyDecision: (id, data) => api.post(`/academic-reviews/${id}/faculty-decision`, data),
  submitHODDecision: (id, data) => api.post(`/academic-reviews/${id}/hod-decision`, data),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getStaffDashboard: () => api.get('/dashboard/staff'),
  getHODDashboard: () => api.get('/dashboard/hod'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
};

export const analyticsAPI = {
  getComplaintAnalytics: (params) => api.get('/analytics/complaints', { params }),
  getFeedbackAnalytics: (params) => api.get('/analytics/feedback', { params }),
  getDepartmentAnalytics: (params) => api.get('/analytics/departments', { params }),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  getSubjects: (params) => api.get('/subjects', { params }),
  getTeachersInDepartment: (deptId) => api.get(`/departments/${deptId}/teachers`),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const auditLogAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
};

export const departmentAPI = {
  getAll: () => api.get('/users/departments'),
  create: (data) => api.post('/users/departments', data),
  update: (id, data) => api.put(`/users/departments/${id}`, data),
  delete: (id) => api.delete(`/users/departments/${id}`),
  getTeachers: (deptId) => api.get(`/users/departments/${deptId}/teachers`),
};

export default api;
