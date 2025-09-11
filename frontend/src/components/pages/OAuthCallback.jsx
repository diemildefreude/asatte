// src/pages/AuthCallback.jsx (This needs to be a standalone route, not a child component)

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

function OAuthCallback() 
{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginSocialUser } = useAuth();

    useEffect(() => 
    {        
        const accessToken = searchParams.get('access_token');
        const userDataString = searchParams.get('user');
        const status = searchParams.get('status');
        const originPage = searchParams.get('origin_page');
    
        if (accessToken && userDataString) 
        {
            try 
            {
                const user = JSON.parse(userDataString);
                loginSocialUser(accessToken, user);
                let targetPath;
                let stateMessage;

                if (status === 'social_registration_incomplete') 
                {
                    targetPath = '/register'; 
                    stateMessage = 'Welcome! Please complete your profile.';
                } 
                else if (status === 'social_registration_complete') 
                {
                    targetPath = '/dashboard';
                    stateMessage = 'Registration complete. Welcome!';
                } 
                else 
                { // Default for social_login_success
                    targetPath = '/dashboard';
                    stateMessage = 'Successfully logged in.';
                }
                navigate(targetPath, { replace: true, state: { status: status, message: stateMessage } });
            } 
            catch (error) 
            {
                console.error('Error processing social user data from popup:', error);
                const errorMessage = getErrorMessage(error);
                navigate(`/${originPage}`, { replace: true, state: { status: status, message: errorMessage}});
            }
        } 
        else 
        {
            let errorMessage = 'Social login failed. Please try again.';
            if(status === "email_already_registered_social")
            {
                errorMessage = 'An account already exists for this e-mail. Please log in using your e-mail or username + password.'
            }
            navigate(`/login`, { replace: true, state: { status: status, message: errorMessage}});
        }
    }, [searchParams, navigate, loginSocialUser]); // Dependencies

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Processing Social Login...</h2>
            <p>Please wait while we log you in.</p>
            {/* You can add a spinner or loading animation here */}
        </div>
    );
}

export default OAuthCallback;