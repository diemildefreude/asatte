import React, { useState, useEffect, useRef } from 'react';
import './TilesContainer.css';
import Tile from './Tile';
import { ScreenSize, checkIfFetchNeeded } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

const gridPostCounts = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 5, 
    [ScreenSize.Small]: 6,
    [ScreenSize.Mid]: 8,
    [ScreenSize.Wide]: 11
};
let fetchIndex = 1; //index of next post to fetch

function HeroTilesContainer({screenSize, category})
{    
    const [posts, setPosts] = useState([]);
    const { fetchPosts } = useAuth();
    function getPostAmount(currentSize){return gridPostCounts[currentSize]};    
    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSize = useRef(ScreenSize.Nothing);
    const fetchIndexRef = useRef(1);
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
        params.append('start_id', fetchIndexRef.current);
        params.append('category', category);
        const fetchedSize = fetchedScreenSize.current;
        fetchPosts(params).then((data) =>
        {
            if(data.status === 'no_more_posts')
            {
                setAreNoMorePosts(true);
                return;
            }
            setPosts(prev => [...prev, ...data]);
            //fetchIndex += data.length;
            fetchIndexRef.current = data[data.length - 1].id + 1;
            fetchedScreenSize.current = screenSize > fetchedSize ? screenSize : fetchedSize;
        });
    }, [screenSize, category, posts, areNoMorePosts, setAreNoMorePosts]);
    
    const postsToDisplay = posts.length > 0 ? posts.slice(0, getPostAmount(screenSize)) : posts;

    return (
    <div className="tiles-container first-row-taller">
    {
        postsToDisplay.length > 0 ?
        (
            postsToDisplay.map((post) =>
            {
                return <Tile post={post} key={post.id}/>
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