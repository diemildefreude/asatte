import React, { createContext, useContext, useState } from 'react';
import { router } from '@inertiajs/react';

export const LoginType = {
  Email: 'email',
  Github: 'github',
  Google: 'google',
};

const AuthContext = createContext(null);

const callApi = async (path, { method = 'GET', data = null, params = null } = {}) => {
  const base = '/api';
  let url = base + path;
  if (params) url += `?${new URLSearchParams(params).toString()}`;

  const opts = {
    method,
    headers: {
      Accept: 'application/json',
    },
    credentials: 'same-origin',
  };

  if (data) {
    if (data instanceof FormData) {
      opts.body = data;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    }
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      const json = JSON.parse(text || '{}');
      err = json;
    } catch (e) {
      err = text || 'API error';
    }
    throw err;
  }
  try {
    return await res.json();
  } catch (e) {
    return {};
  }
};

export const AuthProvider = ({ children, initialPage = null }) => {
  const pageProps = (initialPage && initialPage.props) || {};
  const initialUser = pageProps?.auth?.user ?? null;

  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [isLoading, setIsLoading] = useState(false);

  // syncInertiaUser allows an Inertia-aware child component to push the
  // latest `props.auth.user` into this provider without calling usePage()
  // from inside the provider (which breaks when provider wraps the Inertia app).
  const syncInertiaUser = (u) => {
    setUser(u ?? null);
    setIsAuthenticated(!!u);
  };

  // Note: `login` and `registerWithEmail` removed; Login/Register pages
  // should post directly with Inertia `useForm` or `router.post`.

  const logout = () => {
    router.post('/logout', {}, {
      onSuccess: () => {
        setUser(null);
        setIsAuthenticated(false);
      },
    });
  };

  const resetPassword = async (email, token, password, passwordConfirmation) => {
    return callApi('/reset-password', { method: 'POST', data: { email, token, password, password_confirmation: passwordConfirmation } });
  };

  // Lightweight wrappers for various API methods so existing imports don't break.
  const fetchPosts = async (params) => callApi('/posts', { method: 'GET', params });

  const toggleLike = async (postId) => callApi(`/posts/${postId}/like`, { method: 'POST' });
  const recordView = async (postId) => callApi(`/posts/${postId}/record-view`, { method: 'POST' });

  const createComment = async (content, postId, parentId = null) => {
    const formData = new FormData();
    formData.append('content', content);
    if (parentId) formData.append('parent_id', parentId);
    return callApi(`/posts/${postId}/comments`, { method: 'POST', data: formData });
  };
  const updateComment = async (commentId, postId, content) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('content', content);
    return callApi(`/posts/${postId}/comments/${commentId}`, { method: 'POST', data: formData });
  };
  const deleteComment = async (commentId, postId) => callApi(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });

  const getUnreadStatus = async () => callApi('/unread-status', { method: 'GET' });

  const toggleFollow = async (userId) => callApi(`/${userId}/follow`, { method: 'POST' });

  const updateAbout = async (statement) => callApi('/update-about', { method: 'POST', data: { statement } });
  const fetchAbout = async () => callApi('/about', { method: 'GET' });

  const toggleAdminPostHide = async (isHidden, postId, message = '') => {
    const formData = new FormData();
    formData.append('is_hidden_by_admin', isHidden);
    if (isHidden && message) formData.append('message_to_user', message);
    formData.append('_method', 'PUT');
    return callApi(`/set-admin-hide/${postId}`, { method: 'POST', data: formData });
  };

  const sendContactMail = async (sender, email, subject, website, content) => {
    const formData = new FormData();
    formData.append('name', sender);
    formData.append('email', email);
    formData.append('subject', subject);
    if (website) formData.append('website', website);
    formData.append('content', content);
    return callApi('/send-contact-mail', { method: 'POST', data: formData });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        logout,
        syncInertiaUser,
        resetPassword,
        fetchPosts,
        toggleLike,
        recordView,
        createComment,
        updateComment,
        deleteComment,
        toggleFollow,
        updateAbout,
        fetchAbout,
        toggleAdminPostHide,
        sendContactMail,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
