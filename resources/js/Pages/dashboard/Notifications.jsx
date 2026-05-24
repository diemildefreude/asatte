import { Head } from '@inertiajs/react';
import DashboardLayout from "./DashboardLayout";
// import LoadNotifications from "./common/LoadNotifications";
import LoadItems from '../../Components/common/LoadItems';
import Notification from "./common/Notification";
import { useAuth } from '../../contexts/AuthContext';
const FETCH_AMOUNT = 10;
function Notifications ()
{
    const { fetchNotifications } = useAuth();
    return (
    <DashboardLayout currentTab="activity" headerText="notifications">
            <Head title="Notifications" />
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
    )
}
export default Notifications;