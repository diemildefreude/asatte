import { Head } from '@inertiajs/react';
import DashboardLayout from "./DashboardLayout";
import AutoloadTilesContainer from '../../Components/common/AutoloadTilesContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from "react";
import { FetchOrder, getScreenSize } from '../../utils/helpers';
function LikedPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchLikedPosts} = useAuth();
    return(
        <DashboardLayout currentTab="activity" headerText="liked posts">
            <Head title="Liked Posts" />
            <AutoloadTilesContainer
                screenSize={screenSize}
                isDashboard={false}
                fetchMethod={fetchLikedPosts}
                fetchOrder={FetchOrder.Descending}
            />
        </DashboardLayout>
    )
}
export default LikedPosts;