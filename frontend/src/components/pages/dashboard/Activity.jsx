import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import LoadItems from "../../common/LoadItems";
import Comment from "../../common/Comment";
import Notification from "./common/Notification";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { FetchOrder, getScreenSize, monitorScreenSize, ScreenSize } from "../../../utils/helpers";
import { useEffect, useState } from "react";
import LimitedTilesContainer from "../../common/LimitedTilesContainer";
import UserCircle from "../../common/UserCircle";

function Activity()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchLikedPosts, fetchUserComments, fetchNotifications, 
        fetchFollowers, fetchFollowing, user} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);

    return (
    <Layout>
        <DashboardLayout currentTab="activity" headerText="activity">
            <div className="activity-box-container">
                <div className="notifications-comments-container">
                    <div className="main-info-box">
                        <LoadItems
                            fetchMethod={async (page) => await fetchNotifications(3,page, true)}
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
                            fetchMethod={async (page) => await fetchUserComments(3, page)}
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
                            fetchMethod={fetchLikedPosts}
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
                        
                        <Link
                            to="/dashboard/liked-posts"
                            className="centered-content"
                        >
                            view all
                        </Link>
                    </div>
                    <div className="main-info-box follows">
                        {/* <h3 className="centered-content">users you follow</h3> */}
                        <LoadItems
                            fetchMethod={async (page, user) => await fetchFollowing(user, 6, page)}
                            renderMethod={(user) =>({user})}
                            Component={UserCircle}
                            itemString="users"
                            fetchAmount={6}
                            user={user}
                            headingText="users you follow"
                            viewAllLink="/dashboard/following"
                        />
                        <LoadItems
                            fetchMethod={async (page, userId) => await fetchFollowers(userId, 6, page)}
                            renderMethod={(user) =>({user})}
                            Component={UserCircle}
                            itemString="users"
                            fetchAmount={6}
                            user={user}
                            headingText="followers"
                            viewAllLink="/dashboard/followers"
                        />                        
                    </div>
                </div>
                </div>
        </DashboardLayout>
    </Layout>
    );
}
export default Activity;