import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import LoadItems from '../../Components/common/LoadItems';
import Comment from '../../Components/common/Comment';
import Notification from "./common/Notification";
import {  Link, router, usePage , Head } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { FetchOrder, getScreenSize, monitorScreenSize, ScreenSize } from '../../utils/helpers';
import { useEffect, useState } from "react";
import LimitedTilesContainer from '../../Components/common/LimitedTilesContainer';
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
            <Head title="Activity" />
        <div className="activity-box-container">
            <div className="notifications-comments-container">
                <div className="main-info-box">
                    <LoadItems
                        initialItems={initialNotifications}
                        renderMethod={(notification) =>({
                            notification
                        })}
                        Component={Notification}
                        itemString="notifications"
                        headingText="notifications"
                        viewAllLink="/dashboard/notifications"
                    />
                </div>
                <div className="main-info-box">
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
                <div className="main-info-box">
                    <h3 className="centered-content">liked posts</h3>
                    <LimitedTilesContainer
                        screenSize={screenSize}
                        arePrivatePosts={false}
                        initialPosts={initialLikedPosts}
                        fetchOrder={FetchOrder.Descending}
                        classes="no-padding"
                        postCounts= {{
                            [ScreenSize.Nothing]: 0,
                            [ScreenSize.Narrow]: 3, 
                            [ScreenSize.Small]: 4,
                            [ScreenSize.Mid]: 4,
                            [ScreenSize.Wide]: 4
                        }}
                        headingText="liked posts"
                        viewAllLink="/dashboard/liked-posts"
                    />
                    
                    <Link href="/dashboard/liked-posts"
                        className="centered-content"
                    >
                        view all
                    </Link>
                </div>
                <div className="main-info-box follows">
                    {/* <h3 className="centered-content">users you follow</h3> */}
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