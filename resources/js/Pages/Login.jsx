import { useState, useEffect } from "react";
import { Link, router, usePage, Head } from '@inertiajs/react';
import FormField from '../Components/common/FormField';
import '../Components/common/Form.css';
import Layout from '../Components/layout/Layout';
import OAuth from '../Components/common/OAuth';
import { getErrorMessage } from '../utils/helpers';

function Login()
{
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission
    // We'll post explicitly with router.post to ensure field names match server expectations
    // No central AuthContext: post directly to web route using Inertia
    const { props } = usePage();
    const from = props?.flash?.from || '/dashboard/profile';
    const message = props?.flash?.message;
    useEffect(() => {
        // if backend set a flash message about successful login redirect will occur
        // keep message handling only
    }, []);
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
      setIsSubmitting(true);
      router.post('/login',
        { login_field: usernameOrEmail, password: password },
        {
          preserveState: false,
          onError: (errors) => {
            const msg = Object.values(errors).flat().join(' ');
            setError(msg || 'Login failed');
          },
          onSuccess: () => {
            // backend will redirect via session logic; Inertia handles it
          },
          onFinish: () => {
            setIsSubmitting(false);
          },
        }
      );
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