import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from '../../Components/common/AutoloadTilesContainer';
import { Category, FetchOrder, getScreenSize, monitorScreenSize, MemberType } from '../../utils/helpers';
import { useState, useEffect } from "react";
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';
import DashboardCreateHeader from "./common/DashboardCreateHeader";

function NewsPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const { props } = usePage();
    const user = props?.auth?.user;
    const initialPosts = props?.newsPosts ?? null;

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return ( 
        <DashboardLayout currentTab="news">
            <PageHead title="News Posts" />
            <DashboardCreateHeader
                headerText="news posts"
                createLink="/dashboard/new-news-post"
                isVerified={user?.member_type === MemberType.Webmaster || user?.member_type === MemberType.Admin}
            />
            <AutoloadTilesContainer 
                screenSize={screenSize}
                isDashboard={true}
                initialPosts={initialPosts}
                partialProp={'newsPosts'}
                fetchOrder={FetchOrder.Descending}
                category={Category.News}
            />
        </DashboardLayout>
    );
}
export default NewsPosts;