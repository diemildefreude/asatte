import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";

function Mail()
{
    return ( 
    <Layout>
        <DashboardLayout currentTab="mail" headerText="mailbox">
        </DashboardLayout>
    </Layout>
    );
}
export default Mail;