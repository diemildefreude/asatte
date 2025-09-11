
import React, { useCallback, useState } from 'react';
import { LoginType, useAuth } from '../../contexts/AuthContext';
import './OAuth.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function OAuth({headerText, onClick, originPage, isSubmittingForm, setIsSubmittingForm}) 
{
    const { isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSocialLogin = useCallback((provider) => 
    {
        setIsSubmitting(true);
        setIsSubmittingForm(true);
        const authURI = `${BACKEND_URL}/api/auth/${provider}/redirect?origin_page=${originPage}`;
        window.location.href = authURI;
    }, [originPage, setIsSubmittingForm]);

    return (
        <div className="social-login-options">
            <h3>{headerText}</h3>
            <button
                onClick={() => { onClick(); handleSocialLogin(LoginType.Google);}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='buttonContent'>continue with google</div><div><img src="/google.png" alt="google icon"/></div>
            </button>
            <button
                onClick={() => { onClick(); handleSocialLogin(LoginType.Github);}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='buttonContent'>continue with github</div><div><img src="/github.png" alt="github icon"/></div>
            </button>
        </div>
    );
}
export default OAuth;