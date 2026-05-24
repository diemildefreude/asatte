import DashboardLayout from "./dashboard/DashboardLayout";
import { useAuth } from '../contexts/AuthContext';
import LoadItems from '../Components/common/LoadItems';
import '../Components/common/Users.css';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from "react";
import UserCircle from '../Components/common/UserCircle';
import { getErrorMessage } from '../utils/helpers';
const FOLLOWERS_PER_PAGE = 100;
const HEADER_TEXT = "users you follow";

    function Following({ user: memberProp })
    {
        const { url } = usePage();
        const isDashboardUrl = url.startsWith('/dashboard/following');
        
        const { user, fetchFollowing } = useAuth();
        const [member, setMember] = useState(memberProp || user);
        
        if (!isDashboardUrl && !memberProp && !user) {
            router.visit('/login');
            return null;
        }

    const content = <>
            { !isDashboardUrl && (<h2 className="centered-content"></h2>) }
            <LoadItems 
                isFullPage={true}    
                fetchMethod={async (page, user) => await fetchFollowing(user, FOLLOWERS_PER_PAGE, page)}
                renderMethod={(user) => ({user})}
                Component={UserCircle}
                itemString="users"
                fetchAmount={FOLLOWERS_PER_PAGE}
                user={member}
                classes="side-padded"
            />
            </>;

    return (
        member && (
        user ? <DashboardLayout headerText={ isDashboardUrl ? HEADER_TEXT : ""}>
                    {content}
            </DashboardLayout> : content
        )
    )
}

export default Following;