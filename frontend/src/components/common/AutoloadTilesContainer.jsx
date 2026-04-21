import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './TilesContainer.css';
import Tile from './Tile';
import { ScreenSize, checkIfFetchNeeded, Category, FetchOrder, getNextFetchIndex, getPostsFetchParams, addFetchedPostsToExcludes } from '../../utils/helpers';
//import { useAuth } from '../../contexts/AuthContext';
const postsPerRow = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 1, 
    [ScreenSize.Small]: 2,
    [ScreenSize.Mid]: 3,
    [ScreenSize.Wide]: 4
};
function AutoloadTilesContainer({screenSize, fetchMethod, category=Category.Archive, 
    userId=null, username=null, isDashboard=false, fetchOrder=FetchOrder.Ascending, searchTerm="", isSearch=false})
{    
    const [posts, setPosts] = useState([]);
    const [areNoMorePosts, setAreNoMorePosts] = useState(false);
    const getPostAmount = useCallback((currentSize) =>
    {return postsPerRow[currentSize]}, []);    
    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchIndexRef = useRef(fetchOrder === FetchOrder.Ascending ? 1 : null);//index of next post to fetch
    const fetchExcludesRef = useRef([]);
    const isFetchingOnScroll = useRef(false);
    const isFetchingOnWidthChange = useRef(false);
    const navigate = useNavigate();
    const lastSearchTerm = useRef("");
    //const userField = isDashboard ? user : null;

    const scrollFetch = useCallback(() =>
    {                 
        //console.log("SCROLLFETCH", isSearch, searchTerm.length);
        if(isSearch && searchTerm.length < 2)
        {
            setAreNoMorePosts(true);
            //console.log("setting anmp:", true);
            return;
        }
        // if(isSearch && searchTerm)
        // {
        //     setAreNoMorePosts(false);
        //     //console.log("setting anmp:", false);
        // }
        if(areNoMorePosts)
        {
            return;
        }
        if(isFetchingOnScroll.current || isFetchingOnWidthChange.current)
        {
            return;
        } 
        const amount = getPostAmount(screenSize);    
        const params =  getPostsFetchParams(amount, category, fetchOrder, 
            fetchIndexRef, fetchExcludesRef, userId, username, searchTerm);   
        isFetchingOnScroll.current = true;
        fetchMethod(params).then((data) =>
        {            
            console.log("fetche ddata?", data);
            if(data.status === 'no_more_posts')
            {
                //console.log("no more posts");
                setAreNoMorePosts(true);
                return;
            }
            //console.log("fetchedPosts", data);
            if(fetchOrder === FetchOrder.Random)
            {
                console.log("data?!", data, fetchExcludesRef.current);
                fetchExcludesRef.current = addFetchedPostsToExcludes(data, fetchExcludesRef.current);
            }
            else
            {
                fetchIndexRef.current = getNextFetchIndex(data, fetchOrder);
            }
            //console.log("scroll:newIndex", fetchIndexRef.current);
            setPosts(prev => [...prev, ...data]);    
        }).catch((err) =>
        {
            const status = err.response?.status || err.status;
            console.log("err", err);
            if(status === 404)
            {
                console.log("navigating away...");
                navigate('/not-found', {replace:true});
            }
        }).finally(() =>
        {
            isFetchingOnScroll.current = false;
        });
    },[getPostAmount, category, screenSize, areNoMorePosts, setAreNoMorePosts,
        fetchOrder, userId, username, searchTerm
    ]);

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
        if(isSearch && !searchTerm)
        {
            setAreNoMorePosts(true);
                        console.log("setting anmp:", true);
            return;
        }
        // if(isSearch)
        // {
        //     setAreNoMorePosts(false);
        //                 console.log("setting anmp:", false);
        // }
        //---
        
        if(isFetchingOnScroll.current || isFetchingOnWidthChange.current)
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
         const params =  getPostsFetchParams(amount, category, fetchOrder,
            fetchIndexRef, fetchExcludesRef,  userId, username, searchTerm);
        const fetchedSize = fetchedScreenSizeRef.current;
        isFetchingOnWidthChange.current = true;
        
        const previousIndex = fetchIndexRef.current;
        fetchMethod(params).then((data) =>
        {
            if(data.status === 'no_more_posts')
            {
                //console.log(data.status);
                setAreNoMorePosts(true);
                return;
            }            
            //console.log("fetchedPosts", data);
            if(fetchOrder === FetchOrder.Random)
            {
                fetchExcludesRef.current = addFetchedPostsToExcludes(data, fetchExcludesRef.current);
            }
            else
            {
                fetchIndexRef.current = getNextFetchIndex(data, fetchOrder);
            }
            //console.log("screen:newIndex", fetchIndexRef.current);
            setPosts(prev => [...prev, ...data]);
            fetchedScreenSizeRef.current = screenSize > fetchedSize ? screenSize : fetchedSize;            
            
        }).catch((err) =>
        {
            console.error("fetch failed", err);
            fetchIndexRef.current = previousIndex;
        }).finally(() =>
        {
            isFetchingOnWidthChange.current = false;
            isFetchingOnScroll.current = false;
        });
        ;
    }, [screenSize, category, posts, getPostAmount, areNoMorePosts, 
        fetchOrder, , userId, username, setAreNoMorePosts]);
    
    const ppr = getPostAmount(screenSize);
    let displayAmount = Math.floor(posts.length / ppr) * ppr; //28 -> 27 | 28 / 3 = 9 * 3 = 27
                                                              // 1 -> 2
    displayAmount = (displayAmount === 0 || areNoMorePosts) ? posts.length : displayAmount;//Math.min(displayAmount, posts.length);   
    
    const postsToDisplay = posts.length > ppr ? posts.slice(0, displayAmount) : posts;


    //console.log("posts2Display", postsToDisplay.length, areNoMorePosts, searchTerm == "");
    return (
    <div className="tiles-container">
    {
        postsToDisplay.length == 0 && areNoMorePosts?
        (
        <p className="centered-content padding-1rem">
            no posts to load.
        </p>
            
        )
        :(postsToDisplay.length > 0 ?
        (
            postsToDisplay.map((post) =>
            {
                //console.log("post map?", post);
                return <Tile 
                    post={post} 
                    key={post.id} 
                    isDashboard={isDashboard}
                    />
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