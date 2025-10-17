import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";

function Activity()
{
    return ( 
    <Layout>
        <DashboardLayout currentTab="activity" headerText="your activity">
            <div className="activity-box-container">
                <div className="main-info-box">
                    
                </div>
                <div className="main-info-box">

                </div>
            </div>
        </DashboardLayout>
    </Layout>
    );
}
export default Activity;