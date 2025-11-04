import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import LoadItems from "../../common/LoadItems";
import Comment from "../../common/Comment";
import { useAuth } from "../../../contexts/AuthContext";
const ITEMS_PER_PAGE = 3;

function UserComments ()
{
    const { fetchUserComments } = useAuth();
    return (
    <Layout>
        <DashboardLayout currentTab="activity" headerText="your comments">
            <LoadItems
                fetchMethod={async (page) => await fetchUserComments(ITEMS_PER_PAGE, page)}
                renderMethod={(comment, i) =>({
                    comment,
                    id: i,
                    isDashboard:true
                })}
                Component={Comment}
                itemString="comments"
                isFullPage={true}
                classes="side-padded"
                fetchAmount={ITEMS_PER_PAGE}
            />
        </DashboardLayout> 
    </Layout>    
    )
}
export default UserComments;