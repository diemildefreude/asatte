import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormField from "../common/FormField";
import "../common/LoginRegistration.css";
import Layout from "../layout/Layout";
import OAuth from "../common/OAuth";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "../../utils/helpers";

function Login()
{
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission

    const { isAuthenticated, isLoading, login, logout, user } = useAuth(); // Get the login function from context
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation(); // Hook to get current location state

    const from = location.state?.from?.pathname || '/dashboard';

    useEffect(() => 
    {
        if (!isLoading && isAuthenticated) 
        {
          if(!user?.profile_completed)
          {
            logout();
          }
          else
          {
            navigate(from, { replace: true });
          }
        }
    }, [isAuthenticated, isLoading, navigate, from, user, logout]);

    useEffect(() => 
    {
        if (location.state && location.state.message) 
        {
          const message = location?.state?.message;                          
          setSuccess('');
          setError(message);
          navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);


    const canLogInWithEmail = usernameOrEmail && password && !isSubmitting;

    const handleLoginSubmit = async (e) => 
    {
        e.preventDefault();
        setError('');       // Clear previous errors
        setSuccess('');     // Clear previous success messages
        setIsSubmitting(true); // Disable button

        try 
        {
            const userData = await login(usernameOrEmail, password);
            setSuccess(`Login successful! Welcome, ${userData.username || userData.email}.`);
            console.log(`login successful. redirecting to ${from}`);
            navigate(from, { replace: true });
        } 
        catch (err) 
        {
            console.error('Login error in Login.jsx:', err);
            const displayErrorMessage = getErrorMessage(err);
            setError(displayErrorMessage.trim());            
        } 
        finally 
        {
            setIsSubmitting(false);
        }
    };
    
    const handleSocialLoginSubmit = (type) =>
    {//disable non OAuth fields/buttons if OAuth reg. has started
        setIsSubmitting(true);
    //the rest is handled in OAuth.jsx
    }
    return (
    <Layout>
      <div className="form-container">
        <div className="sub-form-text">
          <p>New? <Link to="/register">Click here to join.</Link></p>
        </div>
        <h2>log in</h2>
        {error && (
          <div className="error">
            {error}
          </div>
        )}
        {success && (
          <div className="notice">
            {success}
          </div>
        )}
        <div className="email-oauth-container">
          <div className="email-form-container">
            <form onSubmit={handleLoginSubmit}>
              <FormField
                id="usernameOrEmail"
                label="username or e-mail"
                placeholder="your e-mail or username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={isSubmitting}
                type="text"
              />
              <FormField
                id="password"
                label="password"
                placeholder="your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                type="password"
              />
              <button type="submit" disabled={!canLogInWithEmail}>
                {isSubmitting ? 'logging in...' : 'log in'}
              </button>
              <Link to="/password-recovery" className="sub-field-link">Forgot your password?</Link>
            </form>            
          </div>
          <OAuth headerText="or:"
              onClick={handleSocialLoginSubmit}
              setError={setError}
              isSubmittingForm={isSubmitting}
              setIsSubmittingForm={setIsSubmitting}
           />
        </div>   
      </div>
    </Layout>
  );
}

export default Login;