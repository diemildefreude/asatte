import Layout from '../Components/layout/Layout';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import { FetchOrder, getScreenSize, monitorScreenSize } from '../utils/helpers';
import { useState, useEffect } from "react";

import PageHead from '../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';

function Posts({ username, archivePosts })
{
    const [screenSize, setScreenSize] = useState(getScreenSize());

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return ( 
    <>
            <PageHead title="Posts" />
        <h1 className='centered-content side-padded top-1rem-bottom-2rem'>{`${username}'s posts`}</h1>
        <AutoloadTilesContainer 
            screenSize={screenSize}
            isDashboard={false}
            username={username}
            fetchOrder={FetchOrder.Descending}
            initialPosts={archivePosts}
            partialProp={'archivePosts'}
        />
    </>
    );
}

Posts.layout = page => <Layout>{page}</Layout>;
export default Posts;