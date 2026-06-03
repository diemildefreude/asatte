import Layout from '../Components/layout/Layout';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import { FetchOrder, getScreenSize, monitorScreenSize } from '../utils/helpers';
import { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import {  Link, router, usePage , Head } from '@inertiajs/react';

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
    <>
            <Head title="Posts" />
        <h2 className='centered-content padded-responsive'>{`${username}'s posts`}</h2>
        <AutoloadTilesContainer 
            screenSize={screenSize}
            isDashboard={false}
            fetchMethod={fetchPosts}
            username={username}
            fetchOrder={FetchOrder.Descending}
        />
    </>
    );
}

Posts.layout = page => <Layout>{page}</Layout>;
export default Posts;