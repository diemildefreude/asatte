import { Head } from '@inertiajs/react';
import DashboardLayout from "./dashboard/DashboardLayout";
import EditProfile from "./dashboard/EditProfile";
import EditBio from "./dashboard/EditBio";
import './DashboardProfile.css';

function Dashboard() 
{
    return (
        <DashboardLayout currentTab="profile" headerText="your profile">
            <Head title="Dashboard" />    
            <div className="profile-boxes-container">   
                <EditProfile/>
                <EditBio/>
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;