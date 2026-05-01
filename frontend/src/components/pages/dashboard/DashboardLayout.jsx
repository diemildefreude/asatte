import { useState, useEffect } from 'react';
import DashboardTab from "../../common/DashboardTab";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage, MemberType } from '../../../utils/helpers';

function DashboardLayout({ currentTab, headerText, children })
{
    const { user, isAuthenticated, logout, getUnreadStatus,
        sendVerificationEmail, refreshUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [hasUnreadMail, setHasUnreadMail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);    

    let containerClasses = "dashboard-container";
    if(hasUnreadNotifications) { containerClasses += ' has-new-notifications'};
    if(hasUnreadMail){containerClasses += ' has-new-mail'};

    useEffect(() =>
    {
        if(isAuthenticated && !user.profile_completed)
        {
            navigate('/register', 
            {
                replace: true, 
                state: { 
                    status: 'social_registration_incomplete',
                    message: 'Welcome! Please complete your profile:'
                } 
            });
            return;
        
        }                
    }, [isAuthenticated, user, navigate]);

    useEffect(() =>
    {
        if (location.state && location.state.message) 
        {
            setSuccess(location.state.message);
            console.log()
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    useEffect(() =>
    {
        getUnreadStatus()
        .then((data) => 
        {
          setHasUnreadMail(data.has_unread_mail);
          setHasUnreadNotifications(data.has_unread_notifications);  
        })
        .catch((err) =>
        {
            console.err(getErrorMessage(err));
        });
    },[setHasUnreadMail, setHasUnreadNotifications]);

    const handleResendVerificationEmail = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try
        {
            let message;
            const status = await sendVerificationEmail();
            if (status === 'send_link_already_verified')
            {
                message = 'Your email address is already verified.';
                setSuccess(message);
            }
            else if (status === 'unauthorized')
            {
                message = 'Please log in to perform this action.';
                setSuccess(message);
                
            setSuccess(message);
            }
            else if (status === 'send_link_sent')
            {
                message = 'Verification e-mail sent. Please check your inbox.';
                setSuccess(message);
            }
            else if (status === 'invalid_link')
            {
                message = 'Invalid link.';
                message = !user?.email_verified_at ? (message + ' Please click above to resend verification e-mail.') : message;
                setError(message);
            }
            else if (status)
            {
                message = status;
                setSuccess(message);
            }
        }
        catch (err)
        {
            console.log('Error sending verification e-mail', err);
        }
        finally
        {
            setIsSubmitting(false);
        }
    }
    
    useEffect(() => 
    {
        const params = new URLSearchParams(location.search);
        const status = params.get('status'); // Get the 'status' query parameter

        async function logoutOnCancel()
        {
            setIsSubmitting(true);
            await logout();
            const message = 'Your registration has been successfully cancelled.';
            setSuccess(message);
            setIsSubmitting(false);
        }

        async function handleVerificationStatus()
        {
            if (status) 
            {
                let message = '';
                if (status === 'verify_verified') 
                {
                    message = 'Your email has been successfully verified!';
                    await refreshUser();
                } 
                else if (status === 'verify_already_verified') 
                {
                    message = 'Your email is already verified.';
                }             
                else if (status === 'verify_already_canceled') 
                { 
                    message = 'This registration has already been canceled or the link is invalid';
                }
                else if (status === 'invalid_link')
                {
                    message = 'Invalid link.';
                    message = (isAuthenticated && !user?.is_email_verified) ? (message + ' Please click above to resend verification e-mail.') : message;
                }
                else if (status === 'cancel_canceled') 
                { 
                    logoutOnCancel();
                }
                else if (status === 'cancel_already_verified') 
                {
                    message = 'Your email address is already verified. No action was taken.';
                } 
                else if (status === 'cancel_user_not_found')
                {
                    message = 'User not found.';
                }
                else if (status === 'cancel_error') 
                {
                    message = 'There was an error processing your request.';
                    message = (isAuthenticated && !user?.is_email_verified) ? (message + ' Please click above to resend verification e-mail.') : message;
                }

                setSuccess(message); // Set the message in state

                navigate(location.pathname, { replace: true });
            }
        }
        handleVerificationStatus();
    }, [location, logout, navigate, isAuthenticated, user, refreshUser]);

    return (
    <div className={containerClasses}>
    {
        isAuthenticated ?
        (
        <>            
            {
                user && !user?.is_email_verified &&
                (                        
                <div className="main-info-box notice-container">
                    <p className="notice">Please check your e-mail to verify your address.</p> 
                    <button onClick={handleResendVerificationEmail} disabled={isSubmitting}>resend</button>
                </div>
                )
            }
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
            <div className="dashboard-nav-content-container">
                <div className="dashboard-tabs-container">
                    <DashboardTab 
                        tabName="profile"
                        iconClasses="fa-regular fa-user"
                        targetPath="/dashboard/profile"
                        currentTab={currentTab}
                    />
                    {
                        (user.member_type == MemberType.Webmaster) && (
                        <DashboardTab 
                            tabName="news"
                            iconClasses="fa-regular fa-newspaper"
                            targetPath="/dashboard/news-posts"
                            currentTab={currentTab}
                        />)
                    }
                    <DashboardTab 
                        tabName="posts"
                        iconClasses="fa-solid fa-images"
                        targetPath="/dashboard/posts"
                        currentTab={currentTab}
                    />
                    <DashboardTab 
                        tabName="activity"
                        iconClasses="fa-regular fa-star"
                        targetPath="/dashboard/activity"
                        currentTab={currentTab}
                    />
                    <DashboardTab 
                        tabName="mail"
                        iconClasses="fa-regular fa-envelope "
                        targetPath="/dashboard/mail"
                        currentTab={currentTab}
                    />    
                </div>                        
                <div className="heading-profile-container">
                {
                    headerText && (    
                        <div className="centered-content no-margin">
                            <h2>{headerText}</h2>   
                        </div>
                    )
                }
                { children}
                </div>
            </div>
        </>):
        (
            <>
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
            <div className="centered-content">
                <h2>Welcome to netart.io.</h2>
                <p>Click <Link to="/login">here</Link> to log in, or <Link to="/register">here</Link> to register.</p>
            </div>
            </>
        )}
        </div>
    );
}

export default DashboardLayout;