import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
// import LoadNotifications from "./common/LoadNotifications";
import LoadItems from "../../common/LoadItems";
import Notification from "./common/Notification";
import { useAuth } from "../../../contexts/AuthContext";
const FETCH_AMOUNT = 3;
function Notifications ()
{
    const { fetchNotifications } = useAuth();
    return (
    <Layout>
        <DashboardLayout currentTab="activity" headerText="notifications">
            <LoadItems
                fetchMethod={async (page) => await fetchNotifications(FETCH_AMOUNT, page, false)}
                renderMethod={(notification) =>({
                    notification
                })}
                fetchAmount={FETCH_AMOUNT}
                Component={Notification}
                itemString="notifications"
                isFullPage={true}
                classes="side-padded"
            />
        </DashboardLayout>
    </Layout>    
    )
}
export default Notifications;