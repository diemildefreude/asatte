import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import AutoloadTilesContainer from "../../common/AutoloadTilesContainer";
import { useAuth } from "../../../contexts/AuthContext";
import { useState } from "react";
import { FetchOrder, getScreenSize } from "../../../utils/helpers";
function LikedPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchLikedPosts} = useAuth();
    return(
    <Layout>
        <DashboardLayout currentTab="activity" headerText="liked posts">
            <AutoloadTilesContainer
                screenSize={screenSize}
                isDashboard={false}
                fetchMethod={fetchLikedPosts}
                fetchOrder={FetchOrder.Descending}
            />
        </DashboardLayout>
    </Layout>
    )
}
export default LikedPosts;