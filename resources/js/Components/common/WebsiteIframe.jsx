import { useRef, useState, useEffect } from "react";

function WebsiteIframe({url, isPopout=false})
{
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const secureUrl = url
        ? url.trim().replace(/^http:\/\//i, 'https://').replace(/^(?!https?:\/\/)/i, 'https://')
        : '';

    const toggleFullscreen = () => 
    {
        if (!document.fullscreenElement) 
        {
            containerRef.current?.requestFullscreen();
        } 
        else 
        {
            document.exitFullscreen();
        }
    };

    useEffect(() => 
    {
        const handleFullscreenChange = () => 
        {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (<div className={`iframe-container ${isPopout ? 'popout-iframe' : 'website-iframe'}`} ref={containerRef}>
        <iframe src={secureUrl}
            allow="camera; microphone; fullscreen; autoplay"
        >
        </iframe>
        {    
            !isPopout && ( 
            <div className={`resize-button ${isFullscreen ? 'minimize' : 'maximize'}`} onClick={toggleFullscreen}>
                <i className={`fa-solid ${isFullscreen ? 'fa-minimize' : 'fa-maximize'}`}></i>
            </div>  ) 
        }
    </div>)
}

export default WebsiteIframe;