import React, { useEffect, useState } from 'react';
import './Layout.css';
import Header from './Header';
import InertiaAuthBridge from '../common/InertiaAuthBridge';
import { usePage, router } from '@inertiajs/react';
import LogoSpikedClean from './LogoSpikedClean';

function Layout({children, isDashboard=false, classes=""})
{

    const { props } = usePage();
    const APP_NAME = props.app_name;
    const [isTouchDevice, setIsTouchDevice] = useState();
    let classNames = isTouchDevice ? "touch-device content" : "content";
    classNames += ` ${classes}`;
    useEffect(() =>
    {
        const removeNavigateListener = router.on('navigate', () => {
            const topFocus = document.getElementById('top-focus-anchor');
            if (topFocus) {
                topFocus.focus();
            } else if (document.activeElement && document.activeElement !== document.body) {
                document.activeElement.blur();
            }
        });

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
            removeNavigateListener();
            if (observer) observer.disconnect();
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
    <>
        <a id="top-focus-anchor" href="#" className="sr-only" tabIndex="-1"></a>
        <Header></Header>
        <InertiaAuthBridge />
        <div className={classNames}>
        {
            isDashboard ? (
                children
            ):(
                <main id="main-content">{children}</main>
            )
        }
        </div>
        <footer>
            <div className="footer-background"></div>
            <div className="copyright">
                <small>{`${APP_NAME} © 2026+`}</small>
                <LogoSpikedClean className="footer-logo" alt={`${props.app_name} logo`}/>
            </div> 
        </footer>
        </>
    );
}

export default Layout;