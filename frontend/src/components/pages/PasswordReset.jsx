import Layout from "../layout/Layout";
import FormField from "../common/FormField";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage, isValidPassword } from "../../utils/helpers";

function PasswordReset() 
{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { resetPassword, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formDisabled, setFormDisabled] = useState(false); // To disable form after initial check
    const [isPasswordFieldValid, setIsPasswordFieldValid] = useState(false);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(false);

    const canReset = email && token && newPassword && passwordConfirmation 
        && isPasswordFieldValid && arePasswordsMatching;

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
        const emailParam = searchParams.get('email');
        const tokenParam = searchParams.get('token');

        if (!emailParam || !tokenParam) 
        {
            setError('Invalid or missing password reset link. Please request a new one.');
            setFormDisabled(true); // Disable the form if link is invalid
            // Optionally, redirect to forgot password page after a delay
            setTimeout(() => navigate('/password-recovery'), 3000);
        } 
        else 
        {
            setEmail(emailParam);
            setToken(tokenParam);
            setError(''); // Clear any previous errors
            setFormDisabled(false); // Enable form
        }
    }, [searchParams, navigate]);

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

    const handleSubmit = async (e) => 
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFormDisabled(true); // Disable form during submission

        try 
        {
            const result = await resetPassword(email, token, newPassword, passwordConfirmation);//, newPasswordConfirmation);
            setSuccess(result.message);
            setNewPassword('');
            setPasswordConfirmation('');
            // Optionally, redirect to login page after success
            setTimeout(() => navigate('/login', { state: { message: 'Password reset successfully. Please log in.' } }), 3000);
        } 
        catch (err) 
        {
            const displayErrorMessage = getErrorMessage(err);
            setError(displayErrorMessage.trim());
            console.error("Password reset error:", err.response?.dat || err.message || err);
            setFormDisabled(false);
        } 
    };

    return (
    <Layout>
        <div className="form-container">
            <h2>set new password</h2>
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
            <form onSubmit={handleSubmit}>
                <FormField 
                    id="password"
                    label="choose a new password"
                    placeholder="requires: a-z, A-Z, and 0-9"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.trimEnd())}
                    onValidate={handlePasswordFormatValidation}
                    disabled={formDisabled}
                    type="password"
                    classes="centered-content vertical-field"
                />
                <FormField 
                    id="password-confirm"
                    label="confirm password"
                    placeholder=""
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value.trimEnd())}
                    disabled={formDisabled}
                    type="password"
                    classes="centered-content vertical-field"
                />
                <button type="submit" disabled={!canReset || formDisabled || isLoading}>
                    {isLoading ? 'resetting...' : 'reset password'}
                </button>
            </form>
        </div>
    </Layout>);
}

export default PasswordReset;