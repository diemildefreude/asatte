import Layout from "../layout/Layout";
import AutoloadTilesContainer from "../common/AutoloadTilesContainer";
import { FetchOrder, getScreenSize, monitorScreenSize } from "../../utils/helpers";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";

function Posts()
{
    const { username } = useParams();
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return ( 
    <Layout>
        <h2 className='centered-content padded-responsive'>{`${username}'s posts`}</h2>
        <AutoloadTilesContainer 
            screenSize={screenSize}
            isDashboard={false}
            fetchMethod={fetchPosts}
            username={username}
            fetchOrder={FetchOrder.Descending}
        />
    </Layout>
    );
}
export default Posts;