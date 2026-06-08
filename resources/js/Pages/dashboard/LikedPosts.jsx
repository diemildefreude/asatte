import PageHead from '../../Components/layout/PageHead';
import DashboardLayout from "./DashboardLayout";
import AutoloadTilesContainer from '../../Components/common/AutoloadTilesContainer';
import { useState } from "react";
import { FetchOrder, getScreenSize } from '../../utils/helpers';

function LikedPosts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    return(
        <DashboardLayout currentTab="activity" headerText="liked posts">
            <PageHead title="Liked Posts" />
            <AutoloadTilesContainer
                screenSize={screenSize}
                isDashboard={false}
                partialProp="likedPosts"
                fetchOrder={FetchOrder.Descending}
            />
        </DashboardLayout>
    )
}
export default LikedPosts;