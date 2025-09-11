import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";

function Activity()
{
    return ( 
    <Layout>
        <DashboardLayout currentTab="activity" headerText="your activity">
        </DashboardLayout>
    </Layout>
    );
}
export default Activity;