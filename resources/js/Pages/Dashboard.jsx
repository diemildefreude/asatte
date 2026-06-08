import PageHead from '../Components/layout/PageHead';
import DashboardLayout from "./dashboard/DashboardLayout";
import EditProfile from "./dashboard/EditProfile";
import EditBio from "./dashboard/EditBio";
import './DashboardProfile.css';

function Dashboard() 
{
    return (
        <DashboardLayout currentTab="profile" headerText="your profile">
            <PageHead title="Dashboard" />    
            <div className="profile-boxes-container">   
                <EditProfile/>
                <EditBio/>
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;