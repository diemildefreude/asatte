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

        const handleResize = () => 
        {
            const isCurrentlyTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsTouchDevice(isCurrentlyTouch);
        };
    
        handleResize();

        const footerElement = document.querySelector('footer');
        let observer;
        if (footerElement) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        document.body.classList.add('at-bottom');
                    } else {
                        document.body.classList.remove('at-bottom');
                    }
                });
            }, {
                rootMargin: '200px'
            });
            observer.observe(footerElement);
        }

        const onScroll = () => {
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) 
            {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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