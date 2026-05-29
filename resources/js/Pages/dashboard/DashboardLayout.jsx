import { useState, useEffect } from 'react';
import DashboardTab from '../../Components/common/DashboardTab';
import {  Link, router, usePage , Head } from '@inertiajs/react';
import { getErrorMessage, MemberType } from '../../utils/helpers';
import Layout from '../../Components/layout/Layout';

function DashboardLayout({ currentTab, headerText, children })
{
    const page = usePage();
    const user = page.props?.auth?.user ?? null;
    const isAuthenticated = !!user;
    const currentUrl = page.url || window.location.pathname;
    const parsedUrl = new URL(currentUrl, window.location.origin);
    const pathname = parsedUrl.pathname;
    const search = parsedUrl.search;
    
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const initialUnread = page.props?.unread ?? {};
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(!!initialUnread.has_unread_notifications);
    const [hasUnreadMail, setHasUnreadMail] = useState(!!initialUnread.has_unread_mail);
    const [isSubmitting, setIsSubmitting] = useState(false);    

    let containerClasses = "dashboard-container";
    if(hasUnreadNotifications) { containerClasses += ' has-new-notifications'};
    if(hasUnreadMail){containerClasses += ' has-new-mail'};

    
    //console.log("hasUnreadMail", hasUnreadMail);
    //console.log("containerClasses", containerClasses);
    //console.log("children?", children);

    useEffect(() =>
    {
        if(isAuthenticated && !user.profile_completed)
        {
            router.visit('/register', 
            {
                replace: true
            });
            return;
        }                
    }, [isAuthenticated, user]);

    useEffect(() =>
    {
        const msg = sessionStorage.getItem('completion_message');
        if (msg) 
        {
            setSuccess(msg);
            sessionStorage.removeItem('completion_message');
            router.visit(pathname, { replace: true });
        }
    }, [page.url]);

    // unread status is supplied from server via Inertia shared props

    const handleResendVerificationEmail = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try
        {
            const res = await fetch('/resend-verification', { method: 'POST', headers: { 'Accept': 'application/json' }, credentials: 'same-origin' });
            const payload = await res.json();
            const status = payload?.status;
            if (status === 'send_link_already_verified')
            {
                setSuccess('Your email address is already verified.');
            }
            else if (status === 'send_link_sent')
            {
                setSuccess('Verification e-mail sent. Please check your inbox.');
            }
            else if (status === 'invalid_link')
            {
                const message = (isAuthenticated && !user?.is_email_verified)
                    ? 'Invalid link. Please click above to resend verification e-mail.'
                    : 'Invalid link.';
                setError(message);
            }
            else if (status)
            {
                setSuccess(status);
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
        const params = new URLSearchParams(search);
        const status = params.get('status'); // Get the 'status' query parameter

        if (!status) return;

        async function logoutOnCancel()
        {
            setIsSubmitting(true);
            await router.post('/logout');
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
                    await router.reload();
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
                router.visit(pathname, { replace: true });
            }
        }
        handleVerificationStatus();
    }, [page.url, isAuthenticated, user]);

    return (
    <Layout classes={containerClasses} isDashboard={true}>
            <Head title="Dashboard Layout" />
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
                <main className="heading-profile-container">
                    
                    {
                        headerText && (    
                            <div className="centered-content bottom-1rem">
                                <h1>{headerText}</h1>   
                            </div>
                        )
                    }
                    {children}
                </main>
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
                <h1>Welcome to netart.io.</h1>
                <p>Click <Link href="/login">here</Link> to log in, or <Link href="/register">here</Link> to register.</p>
            </div>
            </>
        )}
        </Layout>
    );
}

export default DashboardLayout;