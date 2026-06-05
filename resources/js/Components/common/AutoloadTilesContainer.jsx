import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, router, usePage, useRemember } from '@inertiajs/react';
import './TilesContainer.css';
import Tile from './Tile';
import { ScreenSize, checkIfFetchNeeded, Category, FetchOrder, addFetchedPostsToExcludes } from '../../utils/helpers';
const postsPerRow = {
    [ScreenSize.Nothing]: 0,
    [ScreenSize.Narrow]: 1,
    [ScreenSize.Small]: 2,
    [ScreenSize.Mid]: 3,
    [ScreenSize.Wide]: 4
};

function AutoloadTilesContainer({
    screenSize,
    category = Category.Archive,
    userId = null,
    username = null,
    isDashboard = false,
    fetchOrder = FetchOrder.Ascending,
    searchTerm = "",
    isSearch = false,
    initialPosts = null,
    partialProp = 'archivePosts',
    loadOnScroll = true,
    maxItems = null
}) {
    const { props } = usePage();
    const serverPartial = props[partialProp];

    const normalize = (p) => {
        if (!p) return [];
        if (p.data && Array.isArray(p.data)) return p.data;
        if (Array.isArray(p)) return p;
        return [];
    };

    const initialFromServer = initialPosts ? (initialPosts.data && Array.isArray(initialPosts.data) ? initialPosts.data : (Array.isArray(initialPosts) ? initialPosts : [])) : normalize(serverPartial);
    const initialDisplayed = initialFromServer;

    const initialAreNoMore = (isSearch && !searchTerm) || (initialFromServer.length === 0);
    const rememberKey = `${partialProp}-${window.location.pathname}${searchTerm ? '-' + searchTerm : ''}`;
    
    const [posts, setPosts] = useRemember(initialDisplayed || [], `posts-${rememberKey}`);
    const [areNoMorePosts, setAreNoMorePosts] = useRemember(initialAreNoMore, `noMore-${rememberKey}`);

    const getPostAmount = useCallback((currentSize) => { return postsPerRow[currentSize] }, []);

    const prevScreenSizeRef = useRef(ScreenSize.Nothing);
    const fetchedScreenSizeRef = useRef(ScreenSize.Nothing);
    const pageRef = useRef((serverPartial && serverPartial.current_page) ? serverPartial.current_page : 1);
    const lastPageRef = useRef((serverPartial && serverPartial.last_page) ? serverPartial.last_page : null);
    const fetchExcludesRef = useRef(posts.map(p => p.id));
    const isFetchingOnScroll = useRef(false);
    const isFetchingOnWidthChange = useRef(false);
    const pendingRequestRef = useRef(null);

    const requestNext = useCallback((kind = 'scroll', amountOverride = null) => {
        if (isSearch && searchTerm.length < 2) {
            setAreNoMorePosts(true);
            return;
        }
        if (areNoMorePosts) return;
        if (isFetchingOnScroll.current || isFetchingOnWidthChange.current) return;

        const amount = amountOverride ?? getPostAmount(screenSize);
        const query = { amount };
        if (isSearch && searchTerm) query.q = searchTerm;
        if (fetchOrder === FetchOrder.Random) {
            const excludes = fetchExcludesRef.current.join(',');
            if (excludes) query.excludes = excludes;
            query.fetch_order = 'random';
        } else {
            const nextPage = (pageRef.current || 1) + 1;
            query.page = nextPage;
        }

        pendingRequestRef.current = { kind };
        isFetchingOnScroll.current = (kind === 'scroll');
        isFetchingOnWidthChange.current = (kind === 'resize');

        router.get(window.location.pathname, query, {
            only: [partialProp],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: (page) => {
                // Keep URL clean on non-search pages
                if (!isSearch && page) {
                    page.url = window.location.pathname;
                }
            }
        });
    }, [getPostAmount, screenSize, areNoMorePosts, fetchOrder, isSearch, searchTerm, partialProp]);

    const handleScroll = useCallback(() => 
    {
        if (!loadOnScroll) return;
        const yThreshold = document.documentElement.scrollHeight * 0.95;
        if ((window.scrollY + window.innerHeight) > yThreshold
            && !isFetchingOnScroll.current
            && !isFetchingOnWidthChange.current) {
            requestNext('scroll');
        }
    }, [requestNext, loadOnScroll]);

    useEffect(() => {
        if (!loadOnScroll) return;
        const scrollInterval = setInterval(handleScroll, 200);
        return () => { clearInterval(scrollInterval); };
    }, [handleScroll, loadOnScroll]);

    // Handle width changes to top-up the grid (only after initial mount)
    useEffect(() => {
        if (!loadOnScroll) return;
        if (isSearch && !searchTerm) {
            setAreNoMorePosts(true);
            return;
        }
        if (isFetchingOnScroll.current || isFetchingOnWidthChange.current) return;
        if (areNoMorePosts) return;

        // Avoid firing on initial mount where prevScreenSizeRef is Nothing
        if (prevScreenSizeRef.current === ScreenSize.Nothing) {
            prevScreenSizeRef.current = screenSize;
            return;
        }

        const shouldFetch = checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSizeRef);
        if (!shouldFetch) return;

        const ppr = getPostAmount(screenSize);
        const missing = posts.length < ppr ? (ppr - posts.length) : 0;
        if (missing <= 0) return;

        // For paginated endpoints, avoid top-up fetches (they use page-based pagination and may return large pages).
        if (fetchOrder !== FetchOrder.Random) return;

        // For random fetches we can request only the missing amount
        requestNext('resize', missing);
    }, [screenSize, posts, getPostAmount, isSearch, searchTerm, areNoMorePosts, requestNext, fetchOrder, loadOnScroll]);

    // React to Inertia partial updates
    useEffect(() => {
        const partial = props[partialProp];
        const pending = pendingRequestRef.current;
        if (!pending) {
            return; // ignore updates not caused by our requests
        }

        const kind = pending.kind;
        const isPaginator = partial && partial.data && Array.isArray(partial.data);
        let newItems = [];
        if (isPaginator) {
            newItems = partial.data;
            const current = partial.current_page || 1;
            const last = partial.last_page || null;
            pageRef.current = current;
            lastPageRef.current = last;
            if (last && current >= last) setAreNoMorePosts(true);
        } else if (partial && Array.isArray(partial)) {
            newItems = partial;
        } else {
            newItems = [];
        }

        if (newItems.length === 0) {
            setAreNoMorePosts(true);
        } 
        else 
        {
            setPosts((prev) => {
                const existingIds = new Set(prev.map(p => p.id));
                const filtered = newItems.filter(p => !existingIds.has(p.id));
                if (fetchOrder === FetchOrder.Random) {
                    fetchExcludesRef.current = addFetchedPostsToExcludes(filtered, fetchExcludesRef.current);
                }
                return [...prev, ...filtered];
            });
        }

        // Mark that we've fetched for this screen size when resize-triggered
        if (kind === 'resize') 
        {
            fetchedScreenSizeRef.current = screenSize;
        }

        pendingRequestRef.current = null;
        isFetchingOnScroll.current = false;
        isFetchingOnWidthChange.current = false;
    }, [props[partialProp], partialProp, fetchOrder, screenSize]);

    // No client-side caching; always start fresh on load.

    const ppr = getPostAmount(screenSize);
    let displayAmount = Math.floor(posts.length / ppr) * ppr;
    displayAmount = (displayAmount === 0 || areNoMorePosts) ? posts.length : displayAmount;
    let postsToDisplay = posts;
    if (!loadOnScroll && maxItems) {
        postsToDisplay = posts.length > 0 ? posts.slice(0, maxItems[screenSize] || posts.length) : posts;
    } else {
        postsToDisplay = posts.length > ppr ? posts.slice(0, displayAmount) : posts;
    }

    return (
    <div className="tiles-container">
        {
            postsToDisplay.length == 0 && areNoMorePosts ? (
                <p className="centered-content padding-1rem">no posts to load.</p>
            ) : (postsToDisplay.length > 0 ? (
                postsToDisplay.map((post) => {
                    return <Tile post={post} key={post.id} isDashboard={isDashboard} />
                })
            ) : (
                <p className="centered-content padding-1rem">loading posts...</p>
            ))
        }
        {loadOnScroll && (areNoMorePosts || isSearch) && postsToDisplay.length > 0 &&
            <div className="centered-content padding-1rem work-tile">
                <span className="info-text">no more posts to load</span>
            </div>
        }
    </div>
    );
}

export default AutoloadTilesContainer;
