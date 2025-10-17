import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const GRANT_CLIENT_ID = process.env.PASSPORT_CLIENT_ID;
const GRANT_CLIENT_SECRET = process.env.PASSPORT_CLIENT_SECRET;

const api = axios.create
({
  baseURL: `${BACKEND_URL}/api`, // Your Laravel API base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Add Authorization header to every outgoing request
api.interceptors.request.use
(
    (config) => 
    {
        const token = localStorage.getItem('access_token');
        if (token) 
        {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // IMPORTANT: Always return the config object
    },
    (error) => 
    {
        return Promise.reject(error);
    }
);

// Response Interceptor (for handling 401s, token refresh, etc.)
// (As provided in the previous comprehensive example, but you can omit if just focusing on request)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 Unauthorized and it's not the original login/refresh request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to avoid infinite loops

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // attempt to get a new access token using the refresh token
          const refreshResponse = await axios.post(`${BACKEND_URL}/oauth/token`, 
          {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: GRANT_CLIENT_ID,
            client_secret: GRANT_CLIENT_SECRET, 
          });

          localStorage.setItem('access_token', refreshResponse.data.access_token);
          localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);

          // Update the header of the original failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // If refresh fails, log out the user
          localStorage.clear(); // Clear all tokens
          window.location.href = '/login'; // Redirect to login page
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, or initial 401, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;