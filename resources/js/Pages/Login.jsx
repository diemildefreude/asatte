import PageHead from '../Components/layout/PageHead';
import { Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import FormField from '../Components/common/FormField';
import '../Components/common/Form.css';
import Layout from '../Components/layout/Layout';
import OAuth from '../Components/common/OAuth';

function Login()
{
    const { props } = usePage();
    const flash = props?.flash || {};

    const [statusMessage, setStatusMessage] = useState(null);
    const [statusError, setStatusError] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const status = params.get('status');
            if (status === 'cancel_success') {
                setStatusMessage('Your registration has been successfully cancelled.');
            } else if (status === 'cancel_already_verified') {
                setStatusError('Account is already verified and cannot be cancelled.');
            } else if (status === 'invalid_link') {
                setStatusError('Invalid link or account already cancelled.');
            } else if (status === 'cancel_error') {
                setStatusError('An unexpected error occurred while cancelling your registration.');
            }
        }
    }, []);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        login_field: '',
        password: '',
    });

    const canLogInWithEmail = data.login_field && data.password && !processing;

    const handleLoginSubmit = (e) => 
    {
        e.preventDefault();
        
        post('/login', {
            preserveState: true,
            preserveScroll: true,
            // backend will redirect via session logic on success; Inertia handles it
        });
    };
    
    const handleSocialLoginSubmit = (type) =>
    {
        // the rest is handled in OAuth.jsx
    };

    return (
    <>
            <PageHead title="Login" />
      <div className="form-container">
        <div className="sub-form-text">
          <p>New? <Link href="/register">Click here to join.</Link></p>
        </div>
        <h1 className="centered-content no-margin">log in</h1>
        {errors.general && (
          <div className="error">
            {errors.general}
          </div>
        )}
        {(flash.success || statusMessage) && (
          <div className="notice">
            {flash.success || statusMessage}
          </div>
        )}
        {(flash.error || statusError) && (
          <div className="error">
            {flash.error || statusError}
          </div>
        )}
        <div className="field-groups-container">
            <form onSubmit={handleLoginSubmit}>
          <div className="field-group">
              <FormField
                id="login_field"
                label="username or e-mail"
                placeholder="your e-mail or username"
                value={data.login_field}
                onChange={(e) => setData('login_field', e.target.value)}
                disabled={processing}
                type="text"
                classes="centered-content no-margin vertical-field"
                error={errors.login_field}
                onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
              />
              <FormField
                id="password"
                label="password"
                placeholder="your password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                disabled={processing}
                type="password"
                classes="centered-content no-margin vertical-field"
                error={errors.password}
                onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
              />
              <button type="submit" disabled={!canLogInWithEmail}>
                {processing ? 'logging in...' : 'log in'}
              </button>
              <Link href="/password-recovery" className="sub-field-link">Forgot your password?</Link>
                 
          </div>
           </form>      
          <OAuth headerText="or continue with:"
              onClick={handleSocialLoginSubmit}
              setError={(msg) => setError('general', msg)}
              isSubmittingForm={processing}
              // setIsSubmittingForm omitted since we're using processing, 
              // but OAuth might expect a state setter. We can just pass a no-op 
              // or let it manage its own internal loading state.
              setIsSubmittingForm={() => {}}
           />
        </div>   
      </div>
    </>
  );
}


Login.layout = page => <Layout>{page}</Layout>;
export default Login;