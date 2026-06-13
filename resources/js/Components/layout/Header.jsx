import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Header.css';
import '../../Pages/DashboardProfile.css';
import { Link, router, usePage } from '@inertiajs/react';

import UserLink from '../common/UserLink';

function Header()
{
    const { props, url } = usePage();
    const appUrl = props.app_url;
    const user = props?.auth?.user;
    const unread = props?.unread ?? {};
    const hasUnread = !!unread.has_unread_notifications || !!unread.has_unread_mail;
    
    const dashboardUrl = `${appUrl}/dashboard/`;
    
    const isClient = typeof window !== 'undefined';
    const isAuthenticated = !!user;
    const [isNavOpen, setIsNavOpen] = useState(false);
    //const [isSearchOpen, setIsSearchOpen] = useState(false);
    const headerRef = useRef(null);
    const buttonClasses = isNavOpen ? "nav-button-container open"
        : "nav-button-container";
    const navClasses = isNavOpen ? "open" : "";
    const lastScrollTopRef = useRef(isClient ? window.scrollY : 0);
    const didScrollRef = useRef(false);
    const scrollDeltaThreshold = 5;
    
    const pathname = url.split('?')[0];
    const searchString = url.includes('?') ? url.split('?')[1] : '';
    const urlParams = new URLSearchParams(searchString);
    const currentSearchTerm = urlParams.get('q');
    const [searchTerm, setSearchTerm] = useState("");
    const isSearchPage = pathname === "/search";
    const searchInputRef = useRef(null);
    let searchClasses = 'nav-item nav-search-container';
    searchClasses = isSearchPage || searchTerm.length > 0 ? searchClasses + ' always-open' : searchClasses;
    //const [isSearching, setIsSearching] = useState(false);
    

    const toggleMenu = () =>
    {
        setIsNavOpen(prev => !prev);
    }

    useEffect(() =>
    {
        if(pathname == "/search" && currentSearchTerm)
        {
            setSearchTerm(currentSearchTerm);
        }
    },[]);

    useEffect(() =>
    {
        document.body.classList.toggle("nav-open", isNavOpen);

        return () =>
        {
            document.body.classList.toggle("nav-open", false);
        }
    },[isNavOpen]);

    useEffect(() =>
    {
        const detectScroll = () =>
        {
            didScrollRef.current = true;            
        };

        const handleScroll = () =>
        {
            if (!headerRef.current) 
            {
                return;
            }

            const scrollTop = window.scrollY;
            const diff = Math.abs(lastScrollTopRef - scrollTop);

            if(diff <= scrollDeltaThreshold)
            {
                return;
            }

            if(scrollTop > lastScrollTopRef.current)
            {
                headerRef.current.classList.toggle("header-out", true);
                headerRef.current.classList.toggle("header-in", false);
            }
            else        
            {
                headerRef.current.classList.toggle("header-out", false);
                headerRef.current.classList.toggle("header-in", true);
            }

            lastScrollTopRef.current = scrollTop;
        }

        const scrollCheckInterval = setInterval(() =>
        {
            if(didScrollRef.current)
            {
                didScrollRef.current = false;
                handleScroll();
            }
        }, 150);

        window.addEventListener('scroll', detectScroll);
        return () => 
        {
            window.removeEventListener('scroll', detectScroll);
            clearInterval(scrollCheckInterval);
        }
    }, []);

    const handleSearch = useCallback(/*async*/ (e) =>
    {
        e.preventDefault();
        if(!searchTerm || searchTerm.length < 2)
        {
            return;
        }
        const encodedQuery = encodeURIComponent(searchTerm);
        router.visit(`/search?q=${encodedQuery}`);
    },[searchTerm]);

    return (
        <header ref={headerRef}>
            <div className={buttonClasses}>
                <button
                title="nav-button"
                className="js-nav-button nav-button"
                type="button"
                aria-controls="nav-button"
                aria-expanded={isNavOpen}
                onClick={toggleMenu}
                >
                <div className="hamburger">
                    <span className="bar bar1"></span>
                    <span className="bar bar2"></span>
                    <span className="bar bar3"></span>
                </div>
                </button>
            </div>
            <nav className={navClasses}>
                <div className="nav-half first">
                    <form
                        tabIndex="0"
                        onFocus={() => searchInputRef.current?.focus()}
                        onSubmit={handleSearch} 
                        className={searchClasses}>
                        <input id="search" name="search" className="nav-search" type="text" placeholder=" search" 
                            onChange={e => setSearchTerm(e.target.value)} value={searchTerm}
                            ref={searchInputRef}
                        />
                        <button type="submit" tabIndex="-1" aria-label="Submit search">
                            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                        </button>
                    </form>
                    <Link href="/" className="nav-item" onClick={() => setIsNavOpen(false)}>home</Link>
                    <Link href="/news" className="nav-item" onClick={() => setIsNavOpen(false)}>news</Link>
                </div>
                <div className="nav-half second">
                    <Link href="/contact" className="nav-item" onClick={() => setIsNavOpen(false)}>contact</Link>
                    <Link href="/about" className="nav-item" onClick={() => setIsNavOpen(false)}>about</Link>
                    {
                        isAuthenticated ?
                        (
                            <UserLink user={user}
                                additionalClasses={`nav-item ${hasUnread ? 'has-unread' : ''}`}
                                url={dashboardUrl}
                                onClick={() => setIsNavOpen(false)}
                            />
                        ): 
                        (
                            <Link href="/login" className="nav-item" onClick={() => setIsNavOpen(false)}>log in</Link>
                        )
                    }
                </div>                                
            </nav>
        </header>

    );
}

export default Header;