import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const GRANT_CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID;
// const GRANT_CLIENT_SECRET = process.env.PASSPORT_CLIENT_SECRET;
//console.log("GRANT_CLIENT_ID", GRANT_CLIENT_ID);

const api = axios.create
({
  baseURL: `${BACKEND_URL}/api`, // Your Laravel API base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Manage concurrent token refresh requests safely
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => 
{
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error) => 
  {
    const originalRequest = error.config;

    // If the error is 401 Unauthorized and it's not the original login/refresh request
    if (error.response.status === 401 && !originalRequest._retry) 
    {
      // If a refresh operation is already running, pause this request and queue it
      if (isRefreshing) 
      {
        return new Promise((resolve, reject) => 
        {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true; // Mark as retried to avoid infinite loops
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) 
      {
        try 
        {
          const params = new URLSearchParams();
          params.append('grant_type', 'refresh_token');
          params.append('refresh_token', refreshToken);
          params.append('client_id', GRANT_CLIENT_ID);
          // attempt to get a new access token using the refresh token
          const refreshResponse = await axios.post(`${BACKEND_URL}/oauth/token`, params, 
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          const newAccessToken = refreshResponse.data.access_token;
          const newRefreshToken = refreshResponse.data.refresh_token;

          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          console.log("new token set");
          // Update the header of the original failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Unfreeze all background items waiting in the queue
          processQueue(null, newAccessToken);

          // Retry the original request
          return api(originalRequest);
        } 
        catch (refreshError) 
        {
          processQueue(refreshError, null);
          console.error('Failed to refresh token:', refreshError);
          // If refresh fails, log out the user
          //localStorage.clear(); // Clear all tokens
          
          // CONCRETE CHANGE: Clean extraction instead of blanket clear
          // This avoids nuking unrelated layout settings while guaranteeing auth data is gone
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          window.location.href = '/login'; // Redirect to login page
          return Promise.reject(refreshError);
        }
        finally
        {
          isRefreshing = false;
        }
      } 
      else 
      {
        // No refresh token, or initial 401, redirect to login
        //localStorage.clear();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;