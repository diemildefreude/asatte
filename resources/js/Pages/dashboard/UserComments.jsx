import { Head } from '@inertiajs/react';
import DashboardLayout from "./DashboardLayout";
import LoadItems from '../../Components/common/LoadItems';
import Comment from '../../Components/common/Comment';
import { useAuth } from '../../contexts/AuthContext';
const ITEMS_PER_PAGE = 3;

function UserComments ()
{
    const { fetchUserComments } = useAuth();
    return (
    <DashboardLayout currentTab="activity" headerText="your comments">
            <Head title="User Comments" />
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
    )
}
export default UserComments;