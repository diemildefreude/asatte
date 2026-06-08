import PageHead from '../../Components/layout/PageHead';
import DashboardLayout from "./DashboardLayout";
import LoadItems from '../../Components/common/LoadItems';
import Comment from '../../Components/common/Comment';
function UserComments ()
{
    return (
    <DashboardLayout currentTab="activity" headerText="your comments">
            <PageHead title="User Comments" />
        <LoadItems
            partialProp="comments"
            renderMethod={(comment, i) =>({
                comment,
                id: i,
                isDashboard:true
            })}
            Component={Comment}
            itemString="comments"
            isFullPage={true}
            classes="side-padded"
            fetchAmount={10}
        />
    </DashboardLayout> 
    )
}
export default UserComments;