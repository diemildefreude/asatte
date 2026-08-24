import { useState, useEffect } from 'react';
import DashboardTab from '../../Components/common/DashboardTab';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import '../DashboardProfile.css';
import { MemberType } from '../../utils/helpers';
import Layout from '../../Components/layout/Layout';

function DashboardLayout({ currentTab, headerText, children, headerHasMargin=true})
{
    const page = usePage();
    const user = page.props?.auth?.user ?? null;
    const isAuthenticated = !!user;
    const currentUrl = page.url || (typeof window !== 'undefined' ? window.location.pathname : '');
    const appUrl = page.props.app_url || 'http://localhost';
    const parsedUrl = new URL(currentUrl, typeof window !== 'undefined' ? window.location.origin : appUrl);
    const pathname = parsedUrl.pathname;
    
    const [success, setSuccess] = useState('');
    const { post, processing, errors, setError, clearErrors } = useForm();
    const unread = page.props?.unread ?? {};
    const hasUnreadNotifications = !!unread.has_unread_notifications;
    const hasUnreadMail = !!unread.has_unread_mail;
    const headerClasses = headerHasMargin ? "centered-content bottom-1rem" : "centered-content no-margin"

    useEffect(() => 
    {
        const handlePopState = () => {
            setTimeout(() => {
                router.reload({ preserveScroll: true, preserveState: true });
            }, 0);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    let containerClasses = "dashboard-container";
    if(hasUnreadNotifications) { containerClasses += ' has-new-notifications'};
    if(hasUnreadMail){containerClasses += ' has-new-mail'};

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
    }, [page.url, pathname]);

    useEffect(() => {
        // sync flash messages from server-shared Inertia props
        const flash = page.props?.flash || {};
        const params = new URLSearchParams(window.location.search);
        const status = flash.status || params.get('status');

        if (params.has('status')) {
            params.delete('status');
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, document.title, newUrl);
        }
        let message = flash.message || flash.success || '';
        let localError = flash.error || '';

        async function logoutOnCancel()
        {
            await router.post('/logout');
            setSuccess('Your registration has been successfully cancelled.');
        }

        if (status) 
        {
            if (status === 'verify_verified') 
            {
                message = 'Your email has been successfully verified!';
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
                localError = 'Invalid link.';
                localError = (isAuthenticated && !user?.is_email_verified) ? (localError + ' Please click above to resend verification e-mail.') : localError;
            }
            else if (status === 'cancel_canceled') 
            { 
                logoutOnCancel();
                return;
            }
            else if (status === 'cancel_already_verified') 
            {
                message = 'Your email address is already verified. No action was taken.';
            } 
            else if (status === 'cancel_user_not_found')
            {
                localError = 'User not found.';
            }
            else if (status === 'cancel_error') 
            {
                localError = 'There was an error processing your request.';
                localError = (isAuthenticated && !user?.is_email_verified) ? (localError + ' Please click above to resend verification e-mail.') : localError;
            }
            else if (status === 'send_link_sent')
            {
                message = 'Verification e-mail sent!';
            }
            else if (status === 'send_link_already_verified')
            {
                message = 'Your email is already verified.';
            }
        }

        if (message) 
        {
            setSuccess(message);
        } 
        else 
            {
            setSuccess('');
        }
        
        if (localError) {
            setError('general', localError);
        } else {
            clearErrors('general');
        }
    }, [page.url, isAuthenticated, user, page.props?.flash]);

    const handleResendVerificationEmail = (e) =>
    {
        e.preventDefault();
        clearErrors('general');
        setSuccess('');
        post('/resend-verification', {
            preserveScroll: true,
            preserveState: true,
            onError: () => setError('general', 'Unable to send verification e-mail.'),
            onSuccess: () => setSuccess('verification e-mail sent!')
        });
    }

    return (
    <>
    {
        isAuthenticated ?
        (
        <div className={containerClasses}>
            {
                user && !user?.is_email_verified &&
                (                        
                <div className="main-info-box notice-container centered-content no-margin">
                    <p className="notice">Please check your e-mail to verify your address.</p> 
                    <button onClick={handleResendVerificationEmail} disabled={processing}>resend</button>
                </div>
                )
            }
            {errors.general && (
            <div className="error">
                {errors.general}
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
                <main id="main-content" className="heading-profile-container">
                    
                    {
                        headerText && (    
                            <div className={headerClasses}>
                                <h1>{headerText}</h1>   
                            </div>
                        )
                    }
                    {children}
                </main>
            </div>
        </div>):
        (
            <>
            {errors.general && (
            <div className="error">
                {errors.general}
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
        </>
    );
}


DashboardLayout.layout = page => <Layout isDashboard={true}>{page}</Layout>;
export default DashboardLayout;