import Layout from '../Components/layout/Layout';
import FormField from '../Components/common/FormField';
import React, { useState, useEffect } from 'react';
import PageHead from '../Components/layout/PageHead';
import { useForm, usePage } from '@inertiajs/react';
import { isValidPassword } from '../utils/helpers';

function PasswordReset() 
{
    const { props } = usePage();
    const flash = props?.flash || {};

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        email: '',
        token: '',
        password: '',
        password_confirmation: '',
    });

    const [localError, setLocalError] = useState('');
    const [formDisabled, setFormDisabled] = useState(false);
    const [isPasswordFieldValid, setIsPasswordFieldValid] = useState(false);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(false);

    const canReset = data.email && data.token && data.password && data.password_confirmation 
        && isPasswordFieldValid && arePasswordsMatching && !processing;

    const handlePasswordFormatValidation = (proposedPassword, setFieldLocalError) =>
    {
        const isValid = isValidPassword(proposedPassword);
        if(!isValid)
        {
            setFieldLocalError("password must contain at least 8 characters, 1 lower-case letter, 1 upper-case letter, and 1 number")
        }
        else
        {
            setFieldLocalError('');
        }
        setIsPasswordFieldValid(isValid);
        return isValid;
    }

    useEffect(() => 
    {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const emailParam = params.get('email');
            const tokenParam = params.get('token');

            if (!emailParam || !tokenParam) 
            {
                setLocalError('Invalid or missing password reset link. Please request a new one.');
                setFormDisabled(true);
            } 
            else 
            {
                setData({
                    ...data,
                    email: emailParam,
                    token: tokenParam
                });
                setLocalError('');
                setFormDisabled(false);
            }
        }
    }, []);

    useEffect(() =>
    {
        if(data.password_confirmation === "")
        {
            return;
        }
        const areMatching = data.password === data.password_confirmation;
        setArePasswordsMatching(areMatching);
        if(!areMatching)
        {
            setLocalError("Password and confirmation do not match.");
        }
        else
        {
            setLocalError("");
        }
    },[data.password, data.password_confirmation]);

    const handleSubmit = (e) => 
    {
        e.preventDefault();
        setLocalError('');
        
        post('/reset-password', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
    <>
        <PageHead title="Password Reset" />
        <div className="form-container limited-width">
            <h1 className='centered-content'>set new password</h1>
            {localError && (
                <div className="error">
                  {localError}
                </div>
            )}
            {errors.general && (
                <div className="error">
                  {errors.general}
                </div>
            )}
            {errors.email && (
                <div className="error">
                  {errors.email}
                </div>
            )}
            {flash.success && (
            <div className="notice">
                {flash.success}
            </div>
            )}
            <form onSubmit={handleSubmit}>
                <FormField 
                    id="password"
                    label="choose a new password"
                    placeholder="requires: a-z, A-Z, and 0-9"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value.trimEnd())}
                    onValidate={handlePasswordFormatValidation}
                    disabled={formDisabled || processing}
                    type="password"
                    classes="centered-content vertical-field"
                    error={errors.password}
                    onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                />
                <FormField 
                    id="password_confirmation"
                    label="confirm password"
                    placeholder=""
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value.trimEnd())}
                    disabled={formDisabled || processing}
                    type="password"
                    classes="centered-content vertical-field"
                />
                <button type="submit" disabled={!canReset || formDisabled || processing}>
                    {processing ? 'resetting...' : 'reset password'}
                </button>
            </form>
        </div>
    </>);
}

PasswordReset.layout = page => <Layout>{page}</Layout>;
export default PasswordReset;