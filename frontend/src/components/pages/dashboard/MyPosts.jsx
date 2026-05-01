import Layout from "../../layout/Layout";
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
    const {fetchMyPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return ( 
    <Layout>
        <DashboardLayout currentTab="posts">
            <DashboardCreateHeader
                headerText="your posts"
                createLink="/dashboard/new-post"
            />
            <AutoloadTilesContainer 
                screenSize={screenSize}
                isDashboard={true}
                fetchMethod={fetchMyPosts}
                fetchOrder={FetchOrder.Descending}
                category={Category.Archive}
            />
        </DashboardLayout>
    </Layout>
    );
}
export default MyPosts;