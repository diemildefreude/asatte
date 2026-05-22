import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from "../../common/AutoloadTilesContainer";
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from "../../../utils/helpers";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import DashboardCreateHeader from "./common/DashboardCreateHeader";

function MyPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {user, fetchMyPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);
    //console.log("user", user);

    return ( 
    <DashboardLayout currentTab="posts">
        <DashboardCreateHeader
            headerText="your posts"
            createLink="/dashboard/new-post"
            isVerified={user.is_email_verified}
        />
        <AutoloadTilesContainer 
            screenSize={screenSize}
            isDashboard={true}
            fetchMethod={fetchMyPosts}
            fetchOrder={FetchOrder.Descending}
            category={Category.Archive}
        />
    </DashboardLayout>
    );
}
export default MyPosts;