import { useEffect, useState } from "react";
import '../Components/common/Form.css';
import FormField from '../Components/common/FormField';
import Layout from '../Components/layout/Layout';
import { LoginType, useAuth } from '../contexts/AuthContext';
import {  Link, router, usePage , Head } from '@inertiajs/react';
import { getErrorMessage, isValidPassword } from '../utils/helpers';

function PasswordChange()
{
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOldPasswordFieldValid, setIsOldPasswordFieldValid] = useState(false);
    const [isNewPasswordFieldValid, setIsNewPasswordFieldValid] = useState(false);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
    const { user, isAuthenticated, isLoading, changePassword } = useAuth();
    const { props } = usePage();
    const from = props?.flash?.from || '/';
    const canChangePassword = oldPassword && newPassword && passwordConfirmation
        && isOldPasswordFieldValid && isNewPasswordFieldValid 
        && arePasswordsMatching && !isSubmitting;

    useEffect(() =>
    {
        if (!isLoading && !isAuthenticated)
        {
            router.visit(from, { replace: true });
        }
    })

    const handleOldPasswordFormatValidation = (enteredPassword, setFieldLocalError) =>
    {
        const isSomething = enteredPassword.length > 0;
        if(!isSomething)
        {   
            setFieldLocalError("cannot be empty");
        }
        else
        {
            setFieldLocalError('');
        }
        setIsOldPasswordFieldValid(isSomething);
        return isSomething;
    };
    const handleNewPasswordFormatValidation = (proposedPassword, setFieldLocalError) =>
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
        setIsNewPasswordFieldValid(isValid);
        return isValid;
    }

    useEffect(() =>
    {
        if(passwordConfirmation === "")
        {//don't show error if user hasn't entered the confirmation yet
            return;
        }
        const areMatching = newPassword === passwordConfirmation;
        setArePasswordsMatching(areMatching);
        if(!areMatching)
        {
            setError("Password and confirmation do not match.");
        }
        else
        {
            setError("");
        }
    },[newPassword, passwordConfirmation]);

    const handlePasswordChangeSubmit = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try
        {
            await changePassword(oldPassword, newPassword, passwordConfirmation);
            const successMessage = `Password updated successfully.`;
            //setSuccess(successMessage);
            router.visit('/dashboard', { state: { message: successMessage, type: success}});
        }
        catch(err)
        {
            const displayErrorMessage = getErrorMessage(err);   
            setError(displayErrorMessage.trim()); // Set general form error
            console.error('Password change error:', err.response?.data || err.message || err); // Log full error for debugging
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    return (
    <Layout>
            <Head title="Password Change" />
    {
        (user.is_email_verified && user.login_type == LoginType.Email) ? (
            <div className="form-container limited-width">
            <h2>change password</h2>
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
            <form onSubmit={handlePasswordChangeSubmit}>
                <FormField 
                    id="oldPassword"
                    placeholder="your current password"
                    label="old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onValidate={handleOldPasswordFormatValidation}
                    disabled={isSubmitting}
                    type="password"
                />
                <FormField 
                    id="newPassword"
                    placeholder="requires: a-z, A-Z, and 0-9"
                    label="new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onValidate={handleNewPasswordFormatValidation}
                    disabled={isSubmitting}
                    type="password"
                />
                <FormField 
                    id="password-confirm"
                    label="confirm new password"
                    placeholder="same as above"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value.trimEnd())}
                    disabled={isSubmitting}
                    type="password"
                />
                <div className="horizontal-buttons-container">
                    <button type="submit" disabled={!canChangePassword}>
                        {isSubmitting ? 'updating password...' : 'update'}
                    </button>
                    <Link href="/dashboard" className="link-button">back</Link>
                </div>
            </form>
        </div>
        ):(
            <div className="notice centered-content"><p>You cannot change your password as your login type is <em className="bold">{user.login_type}</em></p></div>
        )
    }
        
    </Layout>
    );
}

export default PasswordChange;