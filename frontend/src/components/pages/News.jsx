import Layout from "../layout/Layout";
import AutoloadTilesContainer from "../common/AutoloadTilesContainer";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from "../../utils/helpers";

function News()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);
    
    return(
        <Layout>
            <div className="centered-content">
                <h1>news</h1>                    
            </div>
            <AutoloadTilesContainer
                screenSize={screenSize}
                category={Category.News}
                fetchMethod={fetchPosts}
                fetchOrder={FetchOrder.Descending}
            />
        </Layout>
    );
}

export default News;