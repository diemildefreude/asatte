import Layout from '../Components/layout/Layout';
import DashboardLayout from "./dashboard/DashboardLayout";
import { useAuth } from '../contexts/AuthContext';
import LoadItems from '../Components/common/LoadItems';
import '../Components/common/Users.css';
import { Link, router, usePage, Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import UserCircle from '../Components/common/UserCircle';
import { getErrorMessage } from '../utils/helpers';
const MEMBERS_PER_PAGE = 100;
const HEADER_TEXT = "users you follow";

    function Followers({ user: memberProp })
    {
        const { url } = usePage();
        const isDashboardUrl = url.startsWith('/dashboard/followers');
        
        const { user, fetchFollowers } = useAuth();
        const [member, setMember] = useState(memberProp || user);
        
        if (!isDashboardUrl && !memberProp && !user) {
            router.visit('/login');
            return null;
        }

    const content = <>
            { !isDashboardUrl && (<h2 className="centered-content"></h2>) }
            <LoadItems 
                isFullPage={true}    
                fetchMethod={async (page, user) => await fetchFollowers(user, MEMBERS_PER_PAGE, page)}
                renderMethod={(user) => ({user})}
                Component={UserCircle}
                itemString="users"
                fetchAmount={MEMBERS_PER_PAGE}
                user={member}
                classes="side-padded"
            />
            </>;

    return (
        member && (
        <>
        <Head title="Followers" />
        <Layout>
            { user ? <DashboardLayout headerText={ isDashboardUrl ? HEADER_TEXT : ""}>
                        {content}
                </DashboardLayout> : content
            }
        </Layout>
        </>)
    )
}

export default Followers;