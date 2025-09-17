import Layout from "../layout/Layout";
import DashboardLayout from "./dashboard/DashboardLayout";
import EditProfile from "./dashboard/EditProfile";
import EditBio from "./dashboard/EditBio";
import './DashboardProfile.css';

function Dashboard() 
{
    return (
        <Layout> 
            <DashboardLayout currentTab="profile" headerText="your profile">    
                <div className="profile-boxes-container">   
                    <EditProfile/>
                    <EditBio/>
                </div>
            </DashboardLayout>
        </Layout>
    );
}

export default Dashboard;