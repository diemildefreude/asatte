import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TilesContainer.css';
import Tile from './Tile';
import { ScreenSize, checkIfFetchNeeded, Category } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
const postsPerRow = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 1, 
    [ScreenSize.Small]: 2,
    [ScreenSize.Mid]: 3,
    [ScreenSize.Wide]: 4
};
//let isFirstFetch = true;
function AutoloadTilesContainer({screenSize, category=Category.Archive, userId=null, isDashboard=false })
{    
    const { isAuthenticated, fetchPosts, fetchMyPosts, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [areNoMorePosts, setAreNoMorePosts] = useState(false);
    const getPostAmount = useCallback((currentSize) =>
    {return postsPerRow[currentSize]}, []);    
    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchIndexRef = useRef(1);//index of next post to fetch
    const isFetchingOnScroll = useRef(false);
    const isFetchingOnWidthChange = useRef(false);
    const fetchMethod = isAuthenticated && isDashboard ? fetchMyPosts : fetchPosts;
    const userField = isDashboard ? user : null;

    const getParams = useCallback((amount) =>
    {        
        const params = new URLSearchParams();     
        params.append('amount', amount);
        params.append('start_id', fetchIndexRef.current);
        params.append('category', category);
        if(!isDashboard && userId)
        {
            params.append('user_id', userId);
        }        
        return params;
    },[isDashboard, userId, fetchIndexRef, category]);

    const scrollFetch = useCallback(() =>
    {                 
        //console.log("anmp?", areNoMorePosts);
        if(areNoMorePosts)
        {
            return;
        }
        const amount = getPostAmount(screenSize);    
        const params =  getParams(amount);   
        isFetchingOnScroll.current = true;
        fetchMethod(params).then((data) =>
        {
            //console.log("data?", data);
            if(data.status === 'no_more_posts')
            {
                setAreNoMorePosts(true);
                return;
            }
            fetchIndexRef.current = data[data.length - 1].id + 1;
            setPosts(prev => [...prev, ...data]);    
        }).catch((err) =>
        {
            console.error("fetch failed", err);
            //fetchIndexRef.current -= amount;
        }).finally(() =>
        {
            isFetchingOnScroll.current = false;
        });
    },[getPostAmount, category, screenSize, areNoMorePosts, setAreNoMorePosts]);

    const handleScroll = useCallback(() =>
    {
        const yThreshold = document.documentElement.scrollHeight * 0.95;
        if((window.scrollY + window.innerHeight) > yThreshold
            && !isFetchingOnScroll.current 
            && !isFetchingOnWidthChange.current)
        {            
            scrollFetch();
        }
    }, [scrollFetch]);

    useEffect(() =>
    {        
        const scrollInterval = setInterval(handleScroll, 200);
        return () => 
        {
            clearInterval(scrollInterval);
        }
    },[handleScroll]);

    useEffect(() =>
    {
        //---
        if(isFetchingOnScroll.current)
        {
            return;
        } 
        if(areNoMorePosts)
        {
            return;
        }
        const shouldFetch = checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSizeRef);
        if(!shouldFetch)
        {
            return;
        }
        const ppr = getPostAmount(screenSize);
        const amount = ppr - (posts.length % ppr);
        const params = getParams(amount);
        const fetchedSize = fetchedScreenSizeRef.current;
        isFetchingOnWidthChange.current = true;
        //fetchIndexRef.current += amount;
        fetchMethod(params).then((data) =>
        {
            //console.log("data?", data);
            if(data.status === 'no_more_posts')
            {
                //console.log(data.status);
                setAreNoMorePosts(true);
                return;
            }
            //console.log("widthFetch", data);//[data.length - 1].id);
            fetchIndexRef.current = data[data.length - 1].id + 1;
            setPosts(prev => [...prev, ...data]);
            fetchedScreenSizeRef.current = screenSize > fetchedSize ? screenSize : fetchedSize;            
            
        }).catch((err) =>
        {
            console.error("fetch failed", err);
            fetchIndexRef.current -= amount;
        }).finally(() =>
        {
            isFetchingOnWidthChange.current = false;isFetchingOnScroll.current = false;
        });
        ;
    }, [screenSize, category, posts, getPostAmount, areNoMorePosts, setAreNoMorePosts]);
    
    const ppr = getPostAmount(screenSize);
    let displayAmount = Math.floor(posts.length / ppr) * ppr; //28 -> 27 | 28 / 3 = 9 * 3 = 27
                                                              // 1 -> 2
    displayAmount = (displayAmount === 0 || areNoMorePosts) ? posts.length : displayAmount;//Math.min(displayAmount, posts.length);   
    
    const postsToDisplay = posts.length > ppr ? posts.slice(0, displayAmount) : posts;

    return (
    <div className="tiles-container">
    {
        postsToDisplay == 0 && areNoMorePosts ?
        (
        <p className="centered-content padding-1rem">
            no posts to load.
        </p>
            
        )
        :(postsToDisplay.length > 0 ?
        (
            postsToDisplay.map((post) =>
            {
                return <Tile post={post} key={post.id} user={userField}/>
            })
            
        ) :
        (
            <p className="centered-content padding-1rem">
                loading posts...
            </p>
        ))
    }
    </div>
    )
}

export default AutoloadTilesContainer;