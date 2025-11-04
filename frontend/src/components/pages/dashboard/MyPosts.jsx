import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from "../../common/AutoloadTilesContainer";
import { FetchOrder, getScreenSize, monitorScreenSize } from "../../../utils/helpers";
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";

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
        <DashboardLayout currentTab="posts" headerText="your posts">
            <AutoloadTilesContainer 
                screenSize={screenSize}
                isDashboard={true}
                fetchMethod={fetchMyPosts}
                fetchOrder={FetchOrder.Descending}
            />
        </DashboardLayout>
    </Layout>
    );
}
export default MyPosts;