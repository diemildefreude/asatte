// src/pages/AuthCallback.jsx (This needs to be a standalone route, not a child component)

import React, { useEffect } from 'react';
import PageHead from '../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';
import { getErrorMessage } from '../utils/helpers';

function OAuthCallback() 
{
    const [searchParams] = useSearchParams();
    


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
                router.visit(targetPath, { replace: true, state: { status: status, message: stateMessage } });
            } 
            catch (error) 
            {
                console.error('Error processing social user data from popup:', error);
                const errorMessage = getErrorMessage(error);
                router.visit(`/${originPage}`, { replace: true, state: { status: status, message: errorMessage}});
            }
        } 
        else 
        {
            let errorMessage = 'Social login failed. Please try again.';
            if(status === "email_already_registered_social")
            {
                errorMessage = 'An account already exists for this e-mail. Please log in using the same method used at registration.'
            }
            router.visit(`/login`, { replace: true, state: { status: status, message: errorMessage}});
        }
    }, [searchParams, router]); // Dependencies

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <PageHead title="O Auth Callback" />
            <h2>Processing Social Login...</h2>
            <p>Please wait while we log you in.</p>
            {/* You can add a spinner or loading animation here */}
        </div>
    );
}

export default OAuthCallback;