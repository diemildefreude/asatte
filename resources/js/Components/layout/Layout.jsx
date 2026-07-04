import React, { useEffect, useState } from 'react';
import './Layout.css';
import Header from './Header';
import InertiaAuthBridge from '../common/InertiaAuthBridge';
import { usePage } from '@inertiajs/react';
function Layout({children, isDashboard=false, classes=""})
{

    const { props } = usePage();
    const APP_NAME = props.app_name;
    const [isTouchDevice, setIsTouchDevice] = useState();
    let classNames = isTouchDevice ? "touch-device content" : "content";
    classNames += ` ${classes}`;
    useEffect(() =>
    {
        let ticking = false;
        let isFooterVisible = false;
        const footerElement = document.querySelector('footer');

        const updateFooter = () => {
            if (footerElement) {
                const rect = footerElement.getBoundingClientRect();
                const bottomOffset = window.innerHeight - rect.bottom;
                document.body.style.setProperty('--footer-bottom', `${bottomOffset}px`);
            }
        };

        const handleResize = () => 
        {
            const isCurrentlyTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsTouchDevice(isCurrentlyTouch);
            updateFooter();
        };
    
        handleResize();
    
        const onScroll = () => {
            if (window.scrollX !== 0) {
                document.body.style.setProperty('--scroll-x', `-${window.scrollX}px`);
            } else {
                document.body.style.removeProperty('--scroll-x');
            }

            if (isFooterVisible) {
                updateFooter();
            }
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        };

        let observer;
        if (footerElement) {
            // Start tracking position 500px before the footer enters the viewport 
            // to prevent any pop-in during fast scrolling
            observer = new IntersectionObserver((entries) => 
            {
                entries.forEach(entry => 
                {
                    isFooterVisible = entry.isIntersecting;
                    if (isFooterVisible) 
                    {
                        updateFooter();
                    }
                });
            }, 
            {
                rootMargin: '500px' 
            });
            observer.observe(footerElement);
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });
        onScroll(); // Initialize variables

        return () => 
        {
            if (observer && footerElement) {
                observer.unobserve(footerElement);
            }
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    },[]);

    return (
    <>
        <Header></Header>
        <InertiaAuthBridge />
        <div className={classNames}>
        {
            isDashboard ? (
                children
            ):(
                <main>{children}</main>
            )
        }
        </div>
        <footer>
            <div className="footer-background"></div>
            <div className="copyright"><small>{APP_NAME} © 2026</small></div> 
        </footer>
        </>
    );
}

export default Layout;