import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import api from '../services/api';
import { retryOperation } from '../utils/helpers';
const AuthContext = createContext(null);

export const LoginType =
{
  Email: 'email',
  Github: 'github',
  Google: 'google'
}

export const AuthProvider = ({ children }) => 
{
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // ... login, logout functions ...

    // Initial check for token on app load
    useEffect(() => 
    {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) 
        {
          setIsAuthenticated(true);
          try 
          {
              setUser(JSON.parse(storedUser));
          } 
          catch (e) 
          {
              console.error("Failed to parse user data from localStorage", e);
              localStorage.removeItem('user'); // Clear corrupted data
              setIsAuthenticated(false); // Assume not authenticated if user data is bad
          }
        }
        setIsLoading(false); // Finished initial loading check
    }, []);

    /**
   * Handles the resending of an e-mail verification link.
   * Makes an API call, stores tokens, and updates authentication state.
   * @returns {Promise<Object>} A promise that resolves with user data on success, or rejects with an error.
   */
    const sendVerificationEmail = async () =>
    {
      if(!isAuthenticated)
      {
        return "unauthenticated";
      }
      try
      {
        const response = await api.post('/resend-verification');
        const { status } = response.data;
        return status;
      }
      catch (error) 
      {
          console.error('Registration failed in AuthContext:', error.response?.data || error.message);
          throw error;
      }
    };
     /**
   * Handles the user registration process.
   * Makes an API call, stores tokens, and updates authentication state.
   * @param {LoginType} Email, Github or Google.
   * @param {string} email - The email entered by the user.
   * @param {string} username - The username entered by the user.
   * @param {string} password - The user's password.
   * @param {string} birthdate - The user's birthdate: yyyy-mm-dd'.
   * @returns {Promise<Object>} A promise that resolves with user data on success, or rejects with an error.
   */
    const registerWithEmail = async (loginType, email, username, password, passwordConfirmation, birthdate) =>
    {
      try
      {
        const response = await api.post('/register', 
        {
            login_type: loginType,
            email: email,
            username: username,
            password: password,
            password_confirmation: passwordConfirmation,
            birthdate: birthdate
        });
        const { access_token, refresh_token, user: userData } = response.data;

            // Store tokens and user data in localStorage to log the user in immediately
            localStorage.setItem('access_token', access_token);
            if (refresh_token) 
            {
                localStorage.setItem('refresh_token', refresh_token);
            }
            localStorage.setItem('user', JSON.stringify(userData));

            // Update the React context state
            setIsAuthenticated(true);
            setUser(userData);

            // Return user data to the calling component (e.g., Registration.jsx)
            return userData;
      }
      catch (error) 
      {
          console.error('Registration failed in AuthContext:', error.response?.data || error.message);
          // Clear any potentially lingering or invalid data on failed registration
          localStorage.clear();
          setIsAuthenticated(false);
          setUser(null);
          // Re-throw the error so the calling component can catch and display specific messages
          throw error;
      }
    };
/**
   * Handles the user login process.
   * Makes an API call, stores tokens, and updates authentication state.
   * @param {string} loginField - The username or email entered by the user.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} A promise that resolves with user data on success, or rejects with an error.
   */
    const login = async (loginField, password) => 
    {
        try 
        {
            const response = await api.post('/login', 
            {
                login_field: loginField, // This matches your Laravel controller's expected field
                password: password,
            });

            const { access_token, refresh_token, user: userData } = response.data;

            // Store tokens and user data in localStorage
            localStorage.setItem('access_token', access_token);
            if (refresh_token) {
                localStorage.setItem('refresh_token', refresh_token);
            }
            localStorage.setItem('user', JSON.stringify(userData));

            // Update the React context state
            setIsAuthenticated(true);
            setUser(userData);

            // Return user data or a success indicator
            return userData; // Or { success: true, user: userData }
        } 
        catch (error) 
        {
            console.error('Login failed in AuthContext:', error.response?.data || error.message);
            // Clear any potentially lingering or invalid tokens/user data on failed login
            localStorage.clear();
            setIsAuthenticated(false);
            setUser(null);
            // Re-throw the error to be caught by the component calling `login` (e.g., LoginPage)
            throw error;
        }
  };

  /**
   * Handles the user logout process.
   * Revokes token (backend), clears stored data, and updates authentication state.
   */
  const logout = async () => 
  {
    try {
      // Attempt to call your backend logout endpoint to revoke the token
      await api.post('/logout');
      console.log('Backend token revoked successfully.');
    } catch (error) {
      console.error('Logout error from backend:', error.response?.data || error.message);
    } finally {
      localStorage.clear(); // Clear all auth-related items from localStorage
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refreshUser = async () => 
  {
      try 
      {
          setIsLoading(true); // Set loading state while fetching
          const response = await api.get('/user'); // Call your /api/user endpoint
          setUser(response.data); // Update the user state with fresh data
          localStorage.setItem('user', JSON.stringify(response.data)); // Update localStorage
          console.log("user refreshed?", user);
        } 
      catch (error) 
      {
          console.error("Failed to refresh user data:", error);
          if (error.response && error.response.status === 401) 
          {
              logout(); // Use your existing logout function
          }
      } 
      finally 
      {
          setIsLoading(false);
      }
  };

  const loginSocialUser = useCallback((accessToken, userData) => 
  {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        setIsLoading(false);
  }, []);

  const completeSocialProfile = async(username, birthdate) =>
  {
    try
    {
      setIsLoading(true);
      const response = await api.post('/complete-social-profile',
      {
        username: username,
        birthdate: birthdate
      });
      return response.data;
    }
    catch(error)
    {
      throw error;
    } 
    finally 
    {
        setIsLoading(false);
    }
  }
  const updateBio = async (bio) =>
  {
    try
    {
      setIsLoading(true);
      const response = await api.post('/update-bio',
      {
        bio: bio
      });
      return response.data;
    }
    catch(error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }
  const updateAvatar = async (avatar) => //blob
  {    
    const formData = new FormData();
    formData.append('avatar', avatar, 'canvas_image.webp');
    try
    {
      setIsLoading(true);
      const response = await api.post('/update-avatar', formData,
      {
        headers: {
            'Content-Type': undefined // Let Axios determine the Content-Type for FormData
        }
      });
      return response.data;
    }
    catch (error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }
  const updateProfileInfo = async (website, location) =>
  {
    try
    {
      setIsLoading(true);
      const response = await api.post('/update-profile',
      {
        website: website,
        location: location
      });
      return response.data;
    }
    catch (error) 
    {
      throw error;
    } 
    finally 
    {
        setIsLoading(false);
    }
  }
  const changePassword = async (oldPassword, newPassword, passwordConfirmation) =>
  {
    try
    {
      setIsLoading(true);
      const response = await api.post('/change-password',
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: passwordConfirmation
      }); 
      return response.data;
    } 
    catch (error) 
    {
      throw error;
    } 
    finally 
    {
        setIsLoading(false);
    }
  }

  const requestRecoveryMail = async (usernameOrEmail) =>
  {
    try
    {
      setIsLoading(true);
      const response = await api.post('/request-recovery',
      {
        login_field: usernameOrEmail
      });
      return response.data;
    }
    catch (error) 
    {
      throw error;
    } 
    finally 
    {
        setIsLoading(false);
    }
  }

  const resetPassword = async (email, token, password, passwordConfirmation) => 
  {
      try 
      {
          setIsLoading(true);
          const response = await api.post('/reset-password', 
          {
              email: email,
              token: token,
              password: password,
              password_confirmation: passwordConfirmation,
          });
          const { message, status } = response.data;
          return { message, status }; 
      } 
      catch (error) 
      {
          throw error; // Re-throw the error for the component to handle
      } 
      finally 
      {
          setIsLoading(false);
      }
  };

  const createPost = async ( postUrl, title, subtitle, website, sourceCode, mainVideo, isPrivate, statement, imageFields) =>
  {
    try
    {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('post_url', postUrl);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('website', website);
      formData.append('source_code', sourceCode);
      formData.append('main_video', mainVideo);
      if(isPrivate)
      {
        formData.append('is_private', isPrivate);
      }
      formData.append('statement', statement);
      
      imageFields.forEach((field, index) =>
      {
        if (field.value instanceof File) 
        {
          formData.append(`gallery_images[${index}][file]`, field.value);
        } 
        else 
        {
          formData.append(`gallery_images[${index}][url]`, field.value);
        }
        formData.append(`gallery_images[${index}][alt]`, field.alt);
      });

      const response = await api.post('/posts', formData,
      {
        headers: {
            'Content-Type': undefined // Let Axios determine the Content-Type for FormData
        }
      });
      return response.data;
    }
    catch (error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }

  const updatePost = async ( postId, postUrl, title, subtitle, website, sourceCode, mainVideo, isPrivate, statement, imageFields) =>
  {
    console.log(imageFields);
    try
    {      
      setIsLoading(true);
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('post_url', postUrl);
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('website', website);
      formData.append('source_code', sourceCode);
      formData.append('main_video', mainVideo);
      if(isPrivate)
      {
        formData.append('is_private', isPrivate);
      }
      formData.append('statement', statement);

      imageFields.forEach((field, index) =>
      {
        if (field.value instanceof File) 
        {
          formData.append(`gallery_images[${index}][file]`, field.value);
        } 
        else 
        {
          formData.append(`gallery_images[${index}][url]`, field.value);
        }
        formData.append(`gallery_images[${index}][alt]`, field.alt);
      });
      const response = await api.post(`/posts/${postId}`, formData,
      {
        headers: {
            'Content-Type': undefined // Let Axios determine the Content-Type for FormData
        }
      });
      return response.data;
    }
    catch (error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }

  const deletePost = async (id) =>
  {
    setIsLoading(true);
    try
    {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    }
    catch (error) 
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }

  const fetchSinglePost = async (username, postUrl) =>
  {
      setIsLoading(true);
      const fetchFn = async () =>
      {
        const response = await api.get(`/user/${username}/post/${postUrl}`);
        return response.data;
      }
      return retryOperation(
          fetchFn,
          3, // Number of retries (e.g., 3 attempts total)
          500, // Delay in milliseconds between retries (1.5 seconds)
          'Failed to fetch post after multiple attempts.'
      );
  }

  const fetchPosts = async (params) => 
  {
    //console.log("fetching INDEX...");
      const fetchFn = async () => 
      {
        const response = await api.get('/posts', {params:params});
        //console.log("response", response, "response.data", response.data);
        return response.data;
      };

      // Use the retryOperation for fetchPosts
      return retryOperation(
          fetchFn,
          3, // Number of retries (e.g., 3 attempts total)
          500, // Delay in milliseconds between retries (1.5 seconds)
          'Failed to fetch posts after multiple attempts.'
      );
  };

  const fetchMyPosts = async (params) =>
  {
    //console.log("fetching my posts...", Object.fromEntries(params));
    const fetchFn = async () => 
    {
      const response = await api.get('/my-posts', {params:params});
      return response.data;
    }

    return retryOperation(
        fetchFn,
        3, // Number of retries (e.g., 3 attempts total)
        500, // Delay in milliseconds between retries (1.5 seconds)
        'Failed to fetch posts after multiple attempts.'
    );
  };

  const fetchUser = async (username) =>
  {
    setIsLoading(true);
    try
    {
      const response = await api.get(`/user/${username}`);
      return response.data;
    }
    catch(error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }

  const toggleLike = async (postId) =>
  {
    setIsLoading(true);
    try
    {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    }
    catch(error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }
  
  const recordView = async (postId) =>
  {
     setIsLoading(true);
    try
    {
      const response = await api.post(`/posts/${postId}/record-view`);
      return response.data;
    }
    catch(error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }

  const fetchComments = (postId) =>
  {
    const fetchFn = async () => 
      {
        const response = await api.get(`/${postId}/comments`);
        return response.data;
      };

      // Use the retryOperation for fetchPosts
      return retryOperation(
          fetchFn,
          3, // Number of retries (e.g., 3 attempts total)
          500, // Delay in milliseconds between retries (1.5 seconds)
          'Failed to fetch posts after multiple attempts.'
      );
  }
  const createComment = async (content, postId, parentId=null) =>
  {
    console.log("sending comment api post call");
    try
    {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('content', content);
      if(parentId)
      {
        formData.append('parent_id', parentId);
      }

      const response = await api.post(`/posts/${postId}/comments`, formData);
      return response.data;
    }
    catch (error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }
  const updateComment = async (commentId, postId, content) =>
  {
    console.log("sending comment api put call");
    try
    {
      setIsLoading(true);
      const formData = new FormData();    
      formData.append('_method', 'PUT');
      formData.append('content', content);

      const response = await api.post(`/posts/${postId}/comments/${commentId}`, formData);
      return response.data;
    }
    catch (error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }
  const deleteComment = async (commentId, postId) =>
  {
    console.log("sending comment api delete call");
    try
    {
      setIsLoading(true);

      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return response.data;
    }
    catch (error)
    {
      throw error;
    }
    finally
    {
      setIsLoading(false);
    }
  }
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, 
      changePassword, registerWithEmail, sendVerificationEmail, refreshUser,
      requestRecoveryMail, resetPassword, completeSocialProfile, loginSocialUser,
      updateProfileInfo, isLoading, updateBio, updateAvatar, createPost, updatePost,
      fetchSinglePost, fetchPosts, fetchMyPosts, deletePost, fetchUser, toggleLike,
      recordView, createComment, fetchComments, updateComment, deleteComment}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => 
{
  return useContext(AuthContext);
};