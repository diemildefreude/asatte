import { Head } from '@inertiajs/react';
import DashboardLayout from "./DashboardLayout";
// import LoadNotifications from "./common/LoadNotifications";
import LoadItems from '../../Components/common/LoadItems';
import Notification from "./common/Notification";
function Notifications ()
{
    return (
    <DashboardLayout currentTab="activity" headerText="notifications">
            <Head title="Notifications" />
        <LoadItems
            partialProp="notifications"
            renderMethod={(notification) =>({
                notification
            })}
            fetchAmount={10}
            Component={Notification}
            itemString="notifications"
            isFullPage={true}
            classes="side-padded"
        />
    </DashboardLayout>
    )
}
export default Notifications;