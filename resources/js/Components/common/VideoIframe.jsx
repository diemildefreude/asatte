function VideoIframe({ url })
{
    return (
    <div className= "iframe-container-container">
        <div className="iframe-container">
            <iframe title="video preview" loading="lazy"
                allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                src={url}>
            </iframe>
            <div className="iframe-text">video preview</div>
        </div>
    </div>
    );
}

export default VideoIframe;