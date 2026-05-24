import React, { useState, useEffect, useRef } from 'react';
import './TilesContainer.css';
import Tile from './Tile';
import { Category, FetchOrder, ScreenSize, addFetchedPostsToExcludes, checkIfFetchNeeded, getNextFetchIndex, getPostsFetchParams } from '../../utils/helpers';

const DEFAULT_GRID_POST_COUNTS = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 3, 
    [ScreenSize.Small]: 6,
    [ScreenSize.Mid]: 8,
    [ScreenSize.Wide]: 12
};

function LimitedTilesContainer({screenSize, fetchMethod, userId=null, classes="",
    arePrivatePosts=false, category=Category.Archive, fetchOrder=FetchOrder.Ascending, postCounts=null})
{    
    const [posts, setPosts] = useState([]);
    function getPostAmount(currentSize){return gridPostCounts[currentSize]};    
    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSize = useRef(ScreenSize.Nothing);
    const fetchIndexRef = useRef(fetchOrder === FetchOrder.Ascending ? 1 : null);
    const fetchExcludesRef = useRef([]);
    const [areNoMorePosts, setAreNoMorePosts] = useState(false);
    const classNames = "tiles-container " + classes;
    const gridPostCounts = postCounts ?? DEFAULT_GRID_POST_COUNTS;

    useEffect(() =>
    {
        if(areNoMorePosts || !fetchOrder)
        {
            return;
        }
        const shouldFetch = checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSize);
        if(!shouldFetch)
        {
            return;
        }
        const amount = getPostAmount(screenSize) - posts.length;
        const params = getPostsFetchParams(amount, category, fetchOrder,
            fetchIndexRef, fetchExcludesRef, userId);

        const fetchedSize = fetchedScreenSize.current;
        fetchMethod(params).then((data) =>
        {
            //console.log("posts?", data);
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
    }, [screenSize, category, posts, areNoMorePosts, setAreNoMorePosts, fetchOrder, userId]);
    
    const postsToDisplay = posts.length > 0 ? posts.slice(0, getPostAmount(screenSize)) : posts;

    return (<>    
    {
        postsToDisplay ?
        (     
            postsToDisplay.length > 0 ? (
                <div className={classNames}>
                {                    
                    postsToDisplay.map((post) =>
                    {
                        return <Tile 
                            post={post} 
                            key={post.id} 
                            isDashboard={arePrivatePosts}
                        />
                    })
                }
                </div>) : (
                    <p className="loading centered-content">no posts to display</p>
                )
            ):(
                <p className="loading centered-content">loading posts...</p>
            )
    }
    </>)
}

export default LimitedTilesContainer;