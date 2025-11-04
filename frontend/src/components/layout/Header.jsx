import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserLink from '../common/UserLink';

function Header()
{
    const { isAuthenticated, user } = useAuth();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const headerRef = useRef(null);
    const buttonClasses = isNavOpen ? "nav-button-container open"
        : "nav-button-container";
    const navClasses = isNavOpen ? "open" : "";
    const lastScrollTopRef = useRef(window.scrollY);
    const didScrollRef = useRef(false);
    const scrollDeltaThreshold = 5;

    const toggleMenu = () =>
    {
        setIsNavOpen(prev => !prev);
    }

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
            }
            else        
            {
                headerRef.current.classList.toggle("header-out", false);
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
                    <Link to={`/`} className="nav-item">home</Link>
                    <a className="nav-item" href="#">browse</a>
                    <a className="nav-item" href="#">news</a>
                </div>
                <div className="nav-half second">
                    <a className="nav-item" href="#">contact</a>
                    <a className="nav-item" href="#">about</a>
                    {
                        (isAuthenticated && user.profile_completed) ?
                        (
                            <UserLink user={user}
                                additionalClasses="nav-item"
                                url="/dashboard/profile"
                            />
                        ): 
                        (
                            <Link to="/login" className="nav-item">log in</Link>
                        )
                    }
                </div>                                
            </nav>
        </header>

    );
}

export default Header;