import React, { useState, useEffect, useRef } from 'react';
import './TilesContainer.css';
import Tile from './Tile';
import { FetchOrder, ScreenSize, addFetchedPostsToExcludes, checkIfFetchNeeded, getNextFetchIndex, getPostsFetchParams } from '../../utils/helpers';

const gridPostCounts = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 5, 
    [ScreenSize.Small]: 6,
    [ScreenSize.Mid]: 8,
    [ScreenSize.Wide]: 11
};

function HeroTilesContainer({screenSize, category, fetchOrder=FetchOrder.Ascending, initialPosts=null, fetchMethod=null})
{    
    const [posts, setPosts] = useState(initialPosts || []);
    function getPostAmount(currentSize){return gridPostCounts[currentSize]};    
    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSize = useRef(ScreenSize.Nothing);
    const fetchIndexRef = useRef(1);
    const fetchExcludesRef = useRef([]);
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
        // If the server provided initial posts, avoid client fetch for the first render
        if (initialPosts && initialPosts.length > 0 && posts.length > 0) {
            return;
        }
        const amount = getPostAmount(screenSize) - posts.length;
        const params = getPostsFetchParams(amount, category, fetchOrder,
            fetchIndexRef, fetchExcludesRef);
        const fetchedSize = fetchedScreenSize.current;
        if (!fetchMethod) {
            return; // no client-side fetch method provided
        }
        fetchMethod(params).then((data) =>
        {
            if(data.status === 'no_more_posts')
            {

                setAreNoMorePosts(true);
                return;
            }
            setPosts(prev => [...prev, ...data]);
            if(fetchOrder === FetchOrder.Random)
            {
                fetchExcludesRef.current = addFetchedPostsToExcludes(data, fetchExcludesRef.current);
            }
            else
            {
                fetchIndexRef.current = getNextFetchIndex(data, fetchOrder);
            }
            fetchedScreenSize.current = screenSize > fetchedSize ? screenSize : fetchedSize;
        });
    }, [screenSize, category, posts, areNoMorePosts, setAreNoMorePosts, fetchOrder]);
    
    const postsToDisplay = posts.length > 0 ? posts.slice(0, getPostAmount(screenSize)) : posts;

    return (
    <div className="tiles-container first-row-taller">
    {
        postsToDisplay.length > 0 ?
        (
            postsToDisplay.map((post, index) =>
            {
                return <Tile post={post} key={post.id} size={index < 2 ? "large" : "small"}/>
            })
            
        ) :
        (
            <p className="loading">loading posts...</p>
        )
    }
    </div>
    )
}

export default HeroTilesContainer;