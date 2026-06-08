import PageHead from '../Components/layout/PageHead';
import { useForm, usePage } from '@inertiajs/react';
import FormField from '../Components/common/FormField';
import Layout from '../Components/layout/Layout';
import '../Components/common/Form.css';
import { useState } from 'react';

function PasswordRecovery()
{
    const { props } = usePage();
    const flash = props?.flash || {};

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        login_field: '',
    });

    const canSubmit = data.login_field && !processing;

    const handleRecoverySubmit = (e) =>
    {
        e.preventDefault();
        
        post('/request-recovery', {
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
    <>
        <PageHead title="Password Recovery" />
        <div className="form-container limited-width">
            <h1 className='centered-content no-margin'>account recovery</h1>
            <p className="centered-content no-margin">Enter your email or username. We’ll send you a link to recover your account.</p>
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
            <form onSubmit={handleRecoverySubmit}>
                <FormField
                    id="login_field"
                    placeholder="your e-mail or username"
                    value={data.login_field}
                    onChange={(e) => setData('login_field', e.target.value)}
                    disabled={processing}
                    type="text"
                    classes="centered-content"
                    error={errors.login_field}
                    onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                />
                <button type="submit" disabled={!canSubmit}>
                    {processing ? 'sending...' : 'send e-mail'}
                </button>
            </form>
        </div>
    </>);
}

PasswordRecovery.layout = page => <Layout>{page}</Layout>;
export default PasswordRecovery;