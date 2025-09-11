import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import AutoloadTilesContainer from "../../common/AutoloadTilesContainer";
import { getScreenSize } from "../../../utils/helpers";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Posts()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const [success, setSuccess] = useState('')
    const location = useLocation();

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