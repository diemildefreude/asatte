import { Head } from '@inertiajs/react';
import Layout from '../Components/layout/Layout';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import { useEffect, useState } from "react";
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from '../utils/helpers';

function News({ newsPosts = [] }) {
    const [screenSize, setScreenSize] = useState(getScreenSize());

    useEffect(() => {
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return (
        <Layout>
            <Head title="News" />
            <div className="centered-content">
                <h1>news</h1>
            </div>
            <AutoloadTilesContainer
                screenSize={screenSize}
                category={Category.News}
                fetchOrder={FetchOrder.Descending}
                initialPosts={newsPosts}
                partialProp={'newsPosts'}
            />
        </Layout>
    );
}

export default News;