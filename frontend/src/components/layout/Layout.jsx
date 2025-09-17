import React, { useEffect, useState } from 'react';
import './Layout.css';
import Header from './Header';

function Layout({children})
{
    const [isTouchDevice, setIsTouchDevice] = useState();
    const classes = isTouchDevice ? "touch-device content" : "content";

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
    },[setIsTouchDevice]);

    return (
    <>
        <Header></Header>
        <div className={classes}>
            {children}
        </div>
        </>
    );
}

export default Layout;