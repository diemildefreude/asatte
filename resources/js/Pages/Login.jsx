import { useState, useEffect } from "react";
import {  Link, router, usePage , Head } from '@inertiajs/react';
import FormField from '../Components/common/FormField';
import '../Components/common/Form.css';
import Layout from '../Components/layout/Layout';
import OAuth from '../Components/common/OAuth';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/helpers';

function Login()
{
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission

    const { isAuthenticated, isLoading, login, logout, user } = useAuth(); // Get the login function from context
    const { props } = usePage();
    const from = props?.flash?.from || '/dashboard/profile';
    const message = props?.flash?.message;

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
            router.visit(from, { replace: true });
          }
        }
    }, [isAuthenticated, isLoading, from, user, logout]);

    useEffect(() => 
    {
        if (message) 
        {                          
          setSuccess('');
          setError(message);
        }
    }, [message]);


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
            console.log(`login successful for ${userData.username}. redirecting to ${from}`);
            router.visit(from, { replace: true });
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
            <Head title="Login" />
      <div className="form-container">
        <div className="sub-form-text">
          <p>New? <Link href="/register">Click here to join.</Link></p>
        </div>
        <h1 className="centered-content no-margin">log in</h1>
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
        <div className="field-groups-container">
            <form onSubmit={handleLoginSubmit}>
          <div className="field-group">
              <FormField
                id="usernameOrEmail"
                label="username or e-mail"
                placeholder="your e-mail or username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={isSubmitting}
                type="text"
                classes="centered-content no-margin vertical-field"
              />
              <FormField
                id="password"
                label="password"
                placeholder="your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                type="password"
                classes="centered-content no-margin vertical-field"
              />
              <button type="submit" disabled={!canLogInWithEmail}>
                {isSubmitting ? 'logging in...' : 'log in'}
              </button>
              <Link href="/password-recovery" className="sub-field-link">Forgot your password?</Link>
                 
          </div>
           </form>      
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