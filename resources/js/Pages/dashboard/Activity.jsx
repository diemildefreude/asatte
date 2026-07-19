import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import LoadItems from '../../Components/common/LoadItems';
import Comment from '../../Components/common/Comment';
import Notification from "./common/Notification";
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';

import { FetchOrder, getScreenSize, monitorScreenSize, ScreenSize } from '../../utils/helpers';
import { useEffect, useState } from "react";
import AutoloadTilesContainer from '../../Components/common/AutoloadTilesContainer';
import UserCircle from '../../Components/common/UserCircle';

function Activity()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const { props } = usePage();
    const { 
        initialLikedPosts, 
        initialComments, 
        initialNotifications, 
        initialFollowers, 
        initialFollowing,
        auth: { user }
    } = props;

    useEffect(() => //check screen size at regular intervals.
    {
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);

    return (
    <DashboardLayout currentTab="activity" headerText="activity">
            <PageHead title="Activity" />
        <div className="activity-box-container">
            <div className="notifications-comments-container">
                <div className="main-info-box transparent-background orange-border">
                    <LoadItems
                        initialItems={initialNotifications}
                        renderMethod={(notification) =>({
                            notification
                        })}
                        Component={Notification}
                        itemString="notifications"
                        headingText="notifications"
                        viewAllLink="/dashboard/notifications"
                        headerClasses="teal"
                    />
                </div>
                <div className="main-info-box transparent-background teal-border">
                    <LoadItems
                        initialItems={initialComments}
                        renderMethod={(comment, i) =>({
                            comment,
                            id: i,
                            isDashboard:true
                        })}
                        Component={Comment}
                        itemString="comments"
                        headingText="your comments"
                        viewAllLink="/dashboard/comments"
                    />
                </div>
            </div>
            <div className="posts-follows-container">
                <div className="main-info-box transparent-background bright-blue-border">
                    <h2 className="centered-content"><Link href="/dashboard/liked-posts">liked posts</Link></h2>
                    <AutoloadTilesContainer
                        screenSize={screenSize}
                        initialPosts={initialLikedPosts}
                        loadOnScroll={false}
                        fetchOrder={FetchOrder.Descending}
                        maxItems={{
                            [ScreenSize.Nothing]: 0,
                            [ScreenSize.Narrow]: 3, 
                            [ScreenSize.Small]: 4,
                            [ScreenSize.Mid]: 4,
                            [ScreenSize.Wide]: 6
                        }}
                    />
                    
                    <Link href="/dashboard/liked-posts"
                        className="centered-content"
                    >
                        view all
                    </Link>
                </div>
                <div className="main-info-box follows transparent-background yellow-border">
                    <LoadItems
                        initialItems={initialFollowing}
                        renderMethod={(user) =>({user})}
                        Component={UserCircle}
                        itemString="users"
                        headingText="users you follow"
                        viewAllLink="/dashboard/following"
                    />
                    <LoadItems
                        initialItems={initialFollowers}
                        renderMethod={(user) =>({user})}
                        Component={UserCircle}
                        itemString="users"
                        headingText="followers"
                        viewAllLink="/dashboard/followers"
                    />                        
                </div>
            </div>
            </div>
    </DashboardLayout>
    );
}
export default Activity;