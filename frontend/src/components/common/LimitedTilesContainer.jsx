import React, { useState, useEffect, useRef } from 'react';
import './TilesContainer.css';
import Tile from './Tile';
import { Category, FetchOrder, ScreenSize, checkIfFetchNeeded, getNextFetchIndex } from '../../utils/helpers';

const gridPostCounts = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 3, 
    [ScreenSize.Small]: 6,
    [ScreenSize.Mid]: 8,
    [ScreenSize.Wide]: 12
};

function LimitedTilesContainer({screenSize, fetchMethod, 
    arePrivatePosts=false, category=Category.Archive, fetchOrder=FetchOrder.Ascending})
{    
    const [posts, setPosts] = useState([]);
    function getPostAmount(currentSize){return gridPostCounts[currentSize]};    
    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSize = useRef(ScreenSize.Nothing);
    const fetchIndexRef = useRef(fetchOrder === FetchOrder.Ascending ? 1 : null);
    const [areNoMorePosts, setAreNoMorePosts] = useState(false);

    useEffect(() =>
    {
        if(areNoMorePosts)
        {
            return;
        }
        const shouldFetch = checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSize);
        if(!shouldFetch)
        {
            return;
        }
        const params = new URLSearchParams();
        const amount = getPostAmount(screenSize) - posts.length;
        params.append('amount', amount);
        if(fetchIndexRef.current)
        {
            params.append('start_id', fetchIndexRef.current);
        }
        params.append('category', category);
        const fetchedSize = fetchedScreenSize.current;
        fetchMethod(params).then((data) =>
        {
            if(data.status === 'no_more_posts')
            {
                setAreNoMorePosts(true);
                return;
            }
            setPosts(prev => [...prev, ...data]);
            fetchIndexRef.current = getNextFetchIndex(data, fetchOrder);
            fetchedScreenSize.current = screenSize > fetchedSize ? screenSize : fetchedSize;
        });
    }, [screenSize, category, posts, areNoMorePosts, setAreNoMorePosts]);
    
    const postsToDisplay = posts.length > 0 ? posts.slice(0, getPostAmount(screenSize)) : posts;

    return (
    <div className="tiles-container">
    {
        postsToDisplay.length > 0 ?
        (
            postsToDisplay.map((post) =>
            {
                return <Tile 
                    post={post} 
                    key={post.id} 
                    isDashboard={arePrivatePosts}
                />
            })
            
        ) :
        (
            <p className="loading">loading posts...</p>
        )
    }
    </div>
    )
}

export default LimitedTilesContainer;