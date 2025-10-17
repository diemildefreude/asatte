import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import "../DashboardProfile.css";
import LoadUserComments from "./common/LoadUserComments";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { FetchOrder, getScreenSize, monitorScreenSize } from "../../../utils/helpers";
import { useEffect, useState } from "react";
import LimitedTilesContainer from "../../common/LimitedTilesContainer";

function Activity()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchLikedPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);

    return ( 
    <Layout>
        <DashboardLayout currentTab="activity" headerText="activity">
            <div className="activity-box-container">
                <div className="main-info-box">
                    <h3 className="centered-content">notifications</h3>
                    
                </div>
                <div className="main-info-box">
                    <h3 className="centered-content">your comments</h3>
                    <LoadUserComments/>
                    <Link 
                        to="/dashboard/comments"
                        className="centered-content"
                    >
                        view all
                    </Link>
                </div>
                <div className="main-info-box">
                    <h3 className="centered-content">liked posts</h3>
                    <LimitedTilesContainer
                        screenSize={screenSize}
                        arePrivatePosts={false}
                        fetchMethod={fetchLikedPosts}
                        fetchOrder={FetchOrder.Descending}
                    />
                    <Link
                        to="/dashboard/liked-posts"
                        className="centered-content"
                    >
                        view all
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    </Layout>
    );
}
export default Activity;