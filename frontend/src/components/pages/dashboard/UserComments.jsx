import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import LoadUserComments from "./common/LoadUserComments";
function UserComments ()
{
    return (
    <Layout>
        <DashboardLayout currentTab="activity" headerText="your comments">
            <LoadUserComments isFullPage={true} classes="side-padded"/>
        </DashboardLayout> 
    </Layout>    
    )
}
export default UserComments;