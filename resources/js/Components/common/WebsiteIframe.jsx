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

        const handleKeyDown = (e) => 
        {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const tag = e.target?.tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                tag === 'SELECT' ||
                e.target?.isContentEditable
            ) {
                return;
            }

            if ((e.key === 'f' || e.key === 'F') && !document.fullscreenElement) 
            {
                containerRef.current?.requestFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('keydown', handleKeyDown);
        return () => 
        {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (<div className={`iframe-container ${isPopout ? 'popout-iframe' : 'website-iframe'} ${isFullscreen ? 'fullscreen' : ''}`} 
                ref={containerRef}
                role="region"
                aria-label="Embedded website viewer. Press F to enter fullscreen, or Escape to exit fullscreen."
            >
                <iframe src={secureUrl}
                    title="Embedded website"
                    allow="camera; microphone; fullscreen; autoplay"
                >
                </iframe>
                {    
                    !isPopout && ( 
                    <div
                        className={`resize-button ${isFullscreen ? 'minimize' : 'maximize'}`}
                        onClick={toggleFullscreen}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleFullscreen();
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-keyshortcuts="f"
                        aria-pressed={isFullscreen}
                        aria-label={
                            isFullscreen
                                ? "Exit fullscreen (Press Escape)"
                                : "Enter fullscreen (Shortcut: F, press Escape to exit)"
                        }
                        title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (f)"}
                    >
                        <i className={`fa-solid ${isFullscreen ? 'fa-minimize' : 'fa-maximize'}`} aria-hidden="true"></i>
                    </div>  ) 
                }
            </div>)
}

export default WebsiteIframe;