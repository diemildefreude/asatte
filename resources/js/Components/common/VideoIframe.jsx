function VideoIframe({ url, autoplay=false })
{
    const parsed = new URL(url);
    if(autoplay)
    {
        parsed.searchParams.set('autoplay', '1');
    }    
    const fullUrl = parsed.toString();
    return (
    <div className= "iframe-container-container">
        <div className="iframe-container">
            <iframe title="video preview" loading="lazy"
                allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                src={fullUrl}>
            </iframe>
            <div className="iframe-text">video preview</div>
        </div>
    </div>
    );
}

export default VideoIframe;