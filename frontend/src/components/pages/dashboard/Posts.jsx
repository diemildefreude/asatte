import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from "../../common/AutoloadTilesContainer";
import { getScreenSize } from "../../../utils/helpers";
import { useState } from "react";

function Posts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());

    return ( 
    <Layout>
        <DashboardLayout currentTab="posts" headerText="your posts">
            <AutoloadTilesContainer 
                screenSize={screenSize}
                isDashboard={true}
            />
        </DashboardLayout>
    </Layout>
    );
}
export default Posts;