
import React, { useCallback, useState, useEffect } from 'react';

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

    useEffect(() => {
        const handlePageShow = (e) => {
            if (e.persisted) {
                setIsSubmitting(false);
                if (setIsSubmittingForm) {
                    setIsSubmittingForm(false);
                }
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [setIsSubmittingForm]);

    return (
        <div className="field-group social-login-options">
            <h3>{headerText}</h3>
            <button className='small-text'
                onClick={() => { onClick(); handleSocialLogin('melonland');}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='buttonContent'>melonland</div><div><img src="https://forum.melonland.net/Themes/pimp-my-classic/images/post/xx.gif" alt="melonland icon"/></div>
            </button>
            <button
                onClick={() => { onClick(); handleSocialLogin('google');}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='button-content'>google</div><div><img src="/google.png" alt="google icon"/></div>
            </button>
            <button
                onClick={() => { onClick(); handleSocialLogin('github');}}
                disabled={isSubmitting || isSubmittingForm || isLoading}
            >
                <div className='buttonContent'>github</div><div><img src="/github.png" alt="github icon"/></div>
            </button>            
        </div>
    );
}
export default OAuth;