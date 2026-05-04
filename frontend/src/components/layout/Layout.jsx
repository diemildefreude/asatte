import React, { useEffect, useState } from 'react';
import './Layout.css';
import Header from './Header';

function Layout({children, isDashboard=false, classes=""})
{
    console.log("classes?", classes);
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
    
        window.addEventListener('resize', handleResize);

        return () => 
        {
            window.removeEventListener('resize', handleResize);
        };
    },[]);

    return (
    <>
        <Header></Header>
        <div className={classNames}>
        {
            isDashboard ? (
                children
            ):(
                <main>{children}</main>
            )
        }
        </div>
        </>
    );
}

export default Layout;