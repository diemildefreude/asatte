import { useEffect, useState } from "react";
import '../Components/common/Form.css';
import FormField from '../Components/common/FormField';
import Layout from '../Components/layout/Layout';
import { Link, router, usePage, Head, useForm } from '@inertiajs/react';
import { isValidPassword } from '../utils/helpers';

function PasswordChange()
{
    const { props } = usePage();
    const user = props.auth?.user ?? null;
    const isAuthenticated = !!user;

    const [isOldPasswordFieldValid, setIsOldPasswordFieldValid] = useState(false);
    const [isNewPasswordFieldValid, setIsNewPasswordFieldValid] = useState(false);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
    const [success, setSuccess] = useState('');

    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        old_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const flash = props.flash || {};
    const message = flash.message || '';

    useEffect(() => {
        if (!isAuthenticated) {
            router.visit('/login', { replace: true });
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (message) {
            setSuccess(message);
        } else {
            setSuccess('');
        }
    }, [message]);

    const canChangePassword = data.old_password && data.new_password && data.new_password_confirmation
        && isOldPasswordFieldValid && isNewPasswordFieldValid 
        && arePasswordsMatching && !processing;

    const handleOldPasswordFormatValidation = (enteredPassword) => {
        const isSomething = enteredPassword.length > 0;
        if(!isSomething) {   
            setError('old_password', "cannot be empty");
        } else {
            clearErrors('old_password');
        }
        setIsOldPasswordFieldValid(isSomething);
        return isSomething;
    };

    const handleNewPasswordFormatValidation = (proposedPassword) => {
        const isValid = isValidPassword(proposedPassword);
        if(!isValid) {
            setError('new_password', "password must contain at least 8 characters, 1 lower-case letter, 1 upper-case letter, and 1 number");
        } else {
            clearErrors('new_password');
        }
        setIsNewPasswordFieldValid(isValid);
        return isValid;
    };

    useEffect(() => {
        if(data.new_password_confirmation === "") return;
        const areMatching = data.new_password === data.new_password_confirmation;
        setArePasswordsMatching(areMatching);
        if(!areMatching) {
            setError('new_password_confirmation', "Password and confirmation do not match.");
        } else {
            clearErrors('new_password_confirmation');
        }
    }, [data.new_password, data.new_password_confirmation]);

    const handlePasswordChangeSubmit = (e) => {
        e.preventDefault();
        setSuccess('');
        post('/change-password', {
            preserveScroll: true,
            preserveState: true,
        });
    }

    if (!user) return null;

    return (
    <Layout>
            <Head title="Password Change" />
    {
        (user.is_email_verified && user.login_type === 'email') ? (
            <div className="form-container limited-width">
            <h2>change password</h2>
            {errors.general && (
            <div className="error">
                {errors.general}
            </div>
            )}
            {success && (
            <div className="notice">
                {success}
            </div>
            )}
            <form onSubmit={handlePasswordChangeSubmit}>
                <FormField 
                    id="old_password"
                    placeholder="your current password"
                    label="old password"
                    value={data.old_password}
                    onChange={(e) => setData('old_password', e.target.value)}
                    onValidate={handleOldPasswordFormatValidation}
                    disabled={processing}
                    type="password"
                    error={errors.old_password}
                    onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                />
                <FormField 
                    id="new_password"
                    placeholder="requires: a-z, A-Z, and 0-9"
                    label="new password"
                    value={data.new_password}
                    onChange={(e) => setData('new_password', e.target.value)}
                    onValidate={handleNewPasswordFormatValidation}
                    disabled={processing}
                    type="password"
                    error={errors.new_password}
                    onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                />
                <FormField 
                    id="new_password_confirmation"
                    label="confirm new password"
                    placeholder="same as above"
                    value={data.new_password_confirmation}
                    onChange={(e) => setData('new_password_confirmation', e.target.value.trimEnd())}
                    disabled={processing}
                    type="password"
                    error={errors.new_password_confirmation}
                />
                <div className="horizontal-buttons-container">
                    <button type="submit" disabled={!canChangePassword}>
                        {processing ? 'updating password...' : 'update'}
                    </button>
                    <Link href="/dashboard" className="link-button">back</Link>
                </div>
            </form>
        </div>
        ):(
            <div className="notice centered-content"><p>You cannot change your password as your login type is <em className="bold">{user?.login_type}</em></p></div>
        )
    }
        
    </Layout>
    );
}

export default PasswordChange;