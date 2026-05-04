import { useState } from "react";
import FormField from "../common/FormField";
import Layout from "../layout/Layout";
import "../common/Form.css";
import { getErrorMessage } from "../../utils/helpers";
import { useAuth } from "../../contexts/AuthContext";

function PasswordRecovery()
{
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const canSubmit = usernameOrEmail && !isSubmitting;
    const { requestRecoveryMail } = useAuth();

    const handleRecoverySubmit = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try
        {
            const response = await requestRecoveryMail(usernameOrEmail);
            //const successMessage = "Recovery mail sent. Please check your e-mail.";
            const successMessage = response.message;
            setSuccess(successMessage);
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
            <h2>account recovery</h2>
            <p className="centered-content">Enter your email or username. We’ll send you a link to recover your account.</p>
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
            <form onSubmit={handleRecoverySubmit}>
                <FormField
                    id="usernameOrEmail"
                    placeholder="your e-mail or username"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    disabled={isSubmitting}
                    type="text"
                    classes="centered-content"
                />
                <button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? 'sending...' : 'send e-mail'}
                </button>
            </form>
        </div>
    </Layout>);
}

export default PasswordRecovery;