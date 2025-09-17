import { useEffect, useState } from "react";
import "../common/LoginRegistration.css";
import FormField from "../common/FormField";
import Layout from "../layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, isValidPassword } from "../../utils/helpers";
import { Link } from "react-router-dom";

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
    const { isAuthenticated, isLoading, changePassword } = useAuth();
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const canChangePassword = oldPassword && newPassword && passwordConfirmation
        && isOldPasswordFieldValid && isNewPasswordFieldValid 
        && arePasswordsMatching && !isSubmitting;

    useEffect(() =>
    {
        if (!isLoading && !isAuthenticated)
        {
            navigate(from, { replace: true });
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
            navigate('/dashboard', { state: { message: successMessage, type: success}});
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
        <div className="form-container">
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
                    classes="form-field"
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
                    classes="form-field"
                />
                <FormField 
                    id="password-confirm"
                    label="confirm new password"
                    placeholder="same as above"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value.trimEnd())}
                    disabled={isSubmitting}
                    type="password"
                    classes="form-field"
                />
                <div className="horizontal-buttons-container">
                    <button type="submit" disabled={!canChangePassword}>
                        {isSubmitting ? 'updating password...' : 'update'}
                    </button>
                    <Link to="/dashboard" className="link-button">back</Link>
                </div>
            </form>
        </div>
    </Layout>
    );
}

export default PasswordChange;