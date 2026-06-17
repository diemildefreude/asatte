import React, { useEffect, useState } from 'react';
import './Layout.css';
import Header from './Header';
import InertiaAuthBridge from '../common/InertiaAuthBridge';
import { usePage } from '@inertiajs/react';
function Layout({children, isDashboard=false, classes=""})
{
    //console.log("classes?", classes);
    const { props } = usePage();
    const APP_NAME = props.app_name;
    const [isTouchDevice, setIsTouchDevice] = useState();
    let classNames = isTouchDevice ? "touch-device content" : "content";
    classNames += ` ${classes}`;
    useEffect(() =>
    {
        const handleResize = () => 
        {
            const isCurrentlyTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            //console.log("ICT?", isCurrentlyTouch);
            setIsTouchDevice(isCurrentlyTouch);
        };
    
        handleResize();
    
        const handleScroll = () => {
            if (window.scrollY <= 90) {
                document.documentElement.style.overscrollBehaviorY = 'auto';
                document.body.style.overscrollBehaviorY = 'auto';
            } else {
                document.documentElement.style.overscrollBehaviorY = 'none';
                document.body.style.overscrollBehaviorY = 'none';
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initialize

        return () => 
        {
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