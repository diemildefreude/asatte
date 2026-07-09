import PageHead from '../Components/layout/PageHead';
import DashboardLayout from "./dashboard/DashboardLayout";
import { usePage, Link, router } from '@inertiajs/react';
import EditProfile from "./dashboard/EditProfile";
import EditBio from "./dashboard/EditBio";
import './DashboardProfile.css';
import { useCallback, useState } from 'react';

function Dashboard() 
{
    const { auth } = usePage().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleAccountRestore = useCallback(() =>
    {
        setIsSubmitting(true);
        router.post('/dashboard/restore-account', {}, {
            onFinish: () => setIsSubmitting(false),
        });
    },[]);

    return (<>
        <PageHead title="Dashboard" />        
        <DashboardLayout currentTab="profile" headerText="your profile">
        {
            auth.user.profile_hidden_at && (
                <div className="main-info-box notice-container red-gradient-background">
                    <p className="notice">
                        Your profile is hidden and your account set to be deleted in {
                            Math.max(0, Math.ceil((new Date(auth.user.profile_hidden_at).getTime() + 30 * 24 * 60 * 60 * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                        } days.
                    </p>
                    <div className="centered-content no-margin">
                        <button onClick={handleAccountRestore} 
                            disabled={isSubmitting}
                            className='yellow-button'
                        >
                            Restore account
                        </button>
                    </div>
                </div>
            ) 
        }    
            <div className="profile-boxes-container">   
                <EditProfile/>
                <EditBio/>
            </div>

            <div className="account-deletion-section centered-content">
                {!auth.user.profile_hidden_at && (
                    <Link href="/dashboard/delete-account" className="button">
                        delete account
                    </Link>
                )}
            </div>
        </DashboardLayout>
    </>);
}

export default Dashboard;