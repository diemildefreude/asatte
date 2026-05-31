import Layout from '../Components/layout/Layout';
import DashboardLayout from "./dashboard/DashboardLayout";
import LoadItems from '../Components/common/LoadItems';
import '../Components/common/Users.css';
import { Link, router, usePage, Head } from '@inertiajs/react';
import UserCircle from '../Components/common/UserCircle';

const MEMBERS_PER_PAGE = 100;
const HEADER_TEXT = "your followers";

function Followers({ memberProp })
{
    const { url, props } = usePage();
    const isDashboardUrl = url.startsWith('/dashboard/followers');
    const user = props.auth?.user;
    const member = memberProp || user;
    
    if (!isDashboardUrl && !member && !user) {
        router.visit('/login');
        return null;
    }

    const content = <>
            { !isDashboardUrl && (<h2 className="centered-content"></h2>) }
            <LoadItems 
                isFullPage={true}    
                partialProp="usersList"
                renderMethod={(u) => ({user: u})}
                Component={UserCircle}
                itemString="users"
                fetchAmount={MEMBERS_PER_PAGE}
                classes="side-padded"
            />
            </>;

    return (
        member && (
        <>
        <Head title="Followers" />
            { user ? <DashboardLayout 
                        headerText={ isDashboardUrl ? HEADER_TEXT : ""}
                        currentTab="activity"
                    >
                        {content}
                     </DashboardLayout> : content
            }
        </>)
    )
}

export default Followers;