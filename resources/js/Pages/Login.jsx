import { Link, Head, useForm, usePage } from '@inertiajs/react';
import FormField from '../Components/common/FormField';
import '../Components/common/Form.css';
import Layout from '../Components/layout/Layout';
import OAuth from '../Components/common/OAuth';

function Login()
{
    const { props } = usePage();
    const flash = props?.flash || {};

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
    <Layout>
            <Head title="Login" />
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
        {flash.success && (
          <div className="notice">
            {flash.success}
          </div>
        )}
        {flash.error && (
          <div className="error">
            {flash.error}
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
          <OAuth headerText="or:"
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
    </Layout>
  );
}

export default Login;