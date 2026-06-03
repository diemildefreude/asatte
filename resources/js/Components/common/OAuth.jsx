
import React, { useCallback, useState } from 'react';
import './OAuth.css';

function OAuth({headerText, onClick, originPage, isSubmittingForm, setIsSubmittingForm}) 
{
    const isLoading = false;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSocialLogin = useCallback((provider) => 
    {
        setIsSubmitting(true);
        setIsSubmittingForm(true);
        const authURI = `/auth/${provider}/redirect?origin_page=${originPage}`;
        window.location.href = authURI;
    }, [originPage, setIsSubmittingForm]);

    return (
        <div className="field-group social-login-options">
            <h3>{headerText}</h3>
            <button
                onClick={() => { onClick(); handleSocialLogin('google');}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='button-content'>continue with google</div><div><img src="/google.png" alt="google icon"/></div>
            </button>
            <button
                onClick={() => { onClick(); handleSocialLogin('github');}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='buttonContent'>continue with github</div><div><img src="/github.png" alt="github icon"/></div>
            </button>
        </div>
    );
}
export default OAuth;