import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from '../../Components/common/AutoloadTilesContainer';
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from '../../utils/helpers';
import { useState, useEffect } from "react";
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';
import DashboardCreateHeader from "./common/DashboardCreateHeader";

function MyPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const { props } = usePage();
    const user = props?.auth?.user;
    const initialPosts = props?.myPosts ?? null;

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);


    return ( 
    <DashboardLayout currentTab="posts">
            <PageHead title="Posts" />
        <DashboardCreateHeader
            headerText="your posts"
            createLink="/dashboard/new-post"
            isVerified={user?.is_email_verified}
        />
        <AutoloadTilesContainer 
            screenSize={screenSize}
            isDashboard={true}
            initialPosts={initialPosts}
            partialProp={'myPosts'}
            fetchOrder={FetchOrder.Descending}
            category={Category.Archive}
        />
    </DashboardLayout>
    );
}
export default MyPosts;