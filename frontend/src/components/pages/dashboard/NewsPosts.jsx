import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from "../../common/AutoloadTilesContainer";
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from "../../../utils/helpers";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import DashboardCreateHeader from "./common/DashboardCreateHeader";

function NewsPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return ( 
    <Layout>
        <DashboardLayout currentTab="posts">
            <DashboardCreateHeader
                headerText="news posts"
                createLink="/dashboard/new-news-post"
            />
            <AutoloadTilesContainer 
                screenSize={screenSize}
                isDashboard={true}
                fetchMethod={fetchPosts}
                fetchOrder={FetchOrder.Descending}
                category={Category.News}
            />
        </DashboardLayout>
    </Layout>
    );
}
export default NewsPosts;