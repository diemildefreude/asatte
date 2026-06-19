import React, {useState, useRef, useEffect, useCallback } from 'react';
import "./ImageZoom.css";

function calculateInitialTransform (zoomContainer, outerContainer, imgWidth, imgHeight) 
{
    if (!zoomContainer) return { scale: 1, posX: 0, posY: 0 };
    
    const conW = outerContainer ? outerContainer.offsetWidth : window.innerWidth;
    const conH = outerContainer ? outerContainer.offsetHeight : window.innerHeight;

    const scaleX = conW / imgWidth;
    const scaleY = conH / imgHeight;
    const scale = Math.min(scaleX, scaleY);//Math.max(scaleX, scaleY);

    const posX = (conW - imgWidth * scale) / 2;
    const posY = (conH - imgHeight * scale) / 2;
    
    return { scale, posX, posY };
};

function ImageZoom({ src, smallSrc, alt, isZoomed, clickFunc, outerContainerRef=null, isImageCropper=false})
{      
    const zoomContainerRef = useRef(null);
    const zoomedImageRef = useRef(null);
    const [loadedSrc, setLoadedSrc] = useState(null);
    const isSwappingToLargeRef = useRef(false);
    const currentSrcRef = useRef(src);

    const [transform, setTransform] = useState({ scale: 1, posX: 0, posY: 0 });
    const [naturalSize, setNaturalSize] = useState(null);
    const [initialTransform, setInitialTransform] = useState(null);
    const isPanningRef = useRef(false);
    const lastPanPositionRef = useRef(null);
    const lastPinchDistanceRef = useRef(null);
    const containerClasses = isImageCropper ? "zoomed-image" : `zoomed-image ${!isZoomed ? 'hidden' : ''}`;
    const MIN_SCALE_FACTOR = 1; // Minimum scale relative to initial fit-to-screen scale
    const MAX_SCALE_FACTOR = 5; // Maximum scale relative to initial fit-to-screen scale
    const WHEEL_ZOOM_SENSITIVITY = 0.004;
    const TOUCH_ZOOM_SENSITIVITY = 0.01;
    const PAN_SENSITIVITY = 1; // For mouse wheel panning

    const handleImageLoad = useCallback((event) => 
    {
        const img = event.currentTarget;
        const natSize = { width: img.naturalWidth, height: img.naturalHeight }; 
        const initialT = calculateInitialTransform(zoomContainerRef?.current, outerContainerRef?.current, natSize.width, natSize.height);
        
        setNaturalSize(prevNatSize => {
            if (prevNatSize && isSwappingToLargeRef.current) {
                // We are seamlessly swapping from small to large! Preserve the exact visual zoom!
                const ratio = natSize.width / prevNatSize.width;
                setTransform(prev => ({
                    scale: prev.scale / ratio,
                    posX: prev.posX,
                    posY: prev.posY
                }));
                setInitialTransform(initialT);
                isSwappingToLargeRef.current = false;
                return natSize;
            } else {
                // Normal load (first image, or navigating to a new image). Reset to fit-screen.
                setTransform(initialT);
                setInitialTransform(initialT);
                return natSize;
            }
        });
    }, [setTransform, isZoomed, outerContainerRef]);

    const clampPosition = useCallback((newPosX, newPosY, currentScale) => 
    {
        if (!naturalSize || !initialTransform) return { x: newPosX, y: newPosY };

        const scaledWidth = naturalSize.width * currentScale;
        const scaledHeight = naturalSize.height * currentScale;
        const conW = outerContainerRef ? outerContainerRef.current.offsetWidth : window.innerWidth;
        const conH = outerContainerRef ? outerContainerRef.current.offsetHeight : window.innerHeight;

        let minX = conW - scaledWidth;
        let maxX = 0;
        if (scaledWidth <= conW) { 
        minX = (conW - scaledWidth) / 2; 
        maxX = (conW - scaledWidth) / 2;
        }
        
        let minY = conH - scaledHeight;
        let maxY = 0;
        if (scaledHeight <= conH) { 
        minY = (conH - scaledHeight) / 2; 
        maxY = (conH - scaledHeight) / 2;
        }
        
        return {
        x: Math.max(minX, Math.min(maxX, newPosX)),
        y: Math.max(minY, Math.min(maxY, newPosY)),
        };
    }, [naturalSize, initialTransform]);

    const updateZoom = useCallback((scaleDelta, clientX, clientY) => 
    {
        if (!naturalSize || !initialTransform || !zoomContainerRef.current) return;
        const newScale = transform.scale * scaleDelta;
        const clampedScale = Math.max(
        initialTransform.scale * MIN_SCALE_FACTOR,
        Math.min(initialTransform.scale * MAX_SCALE_FACTOR, newScale)
        );

        if (clampedScale === transform.scale) return; 

        const rect = zoomContainerRef.current.getBoundingClientRect();
        const imageRect = zoomedImageRef.current.getBoundingClientRect();
        
        const mouseRelX = clientX - imageRect.left;
        const mouseRelY = clientY - imageRect.top;

        const newPosX = clientX - rect.left - (mouseRelX / transform.scale) * clampedScale;
        const newPosY = clientY - rect.top - (mouseRelY / transform.scale) * clampedScale;
        
        const clamped = clampPosition(newPosX, newPosY, clampedScale);
        setTransform({ scale: clampedScale, posX: clamped.x, posY: clamped.y });

    }, [transform, naturalSize, initialTransform, clampPosition]);

    const handleWheel = useCallback((e) => 
    {
        if ((!isZoomed && !isImageCropper) || !zoomContainerRef.current) return;
        e.preventDefault();

        if (e.ctrlKey) 
        { 
            const scaleDelta = 1 - e.deltaY * WHEEL_ZOOM_SENSITIVITY;
            updateZoom(scaleDelta, e.clientX, e.clientY);
        } 
        else 
        {
            setTransform(prev => 
            {
                const newPosX = prev.posX - e.deltaX * PAN_SENSITIVITY;
                const newPosY = prev.posY - e.deltaY * PAN_SENSITIVITY;
                const clamped = clampPosition(newPosX, newPosY, prev.scale);
                return { ...prev, posX: clamped.x, posY: clamped.y };
            });
        }
    }, [isZoomed, updateZoom, clampPosition]);

    const handleTouchStart = useCallback((event) => 
    {
        console.log("touch start");
        if (!zoomContainerRef.current) return;
        if (event.touches.length === 1) { 
        isPanningRef.current = true;
        lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        zoomContainerRef.current.style.setProperty('touch-action', 'none'); 
        } else if (event.touches.length === 2) { 
        isPanningRef.current = false; 
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        lastPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        zoomContainerRef.current.style.setProperty('touch-action', 'none');
    }
  }, []);

    const handleTouchMove = useCallback((event) => 
    {
        //console.log("touches", event.touches.length);
        if (!zoomContainerRef.current) return;
        event.preventDefault(); 
        if (isPanningRef.current && event.touches.length === 1 && lastPanPositionRef.current) 
        {
            const deltaX = event.touches[0].clientX - lastPanPositionRef.current.x;
            const deltaY = event.touches[0].clientY - lastPanPositionRef.current.y;
            lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            
            const newPosX = transform.posX + deltaX;
            const newPosY = transform.posY + deltaY;
            const clamped = clampPosition(newPosX, newPosY, transform.scale);
            setTransform(prev => ({ ...prev, posX: clamped.x, posY: clamped.y }));

        } 
        else if (event.touches.length === 2 && lastPinchDistanceRef.current) 
        {
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            const currentDist = Math.sqrt(dx * dx + dy * dy);
            const scaleDelta = 1 + (currentDist - lastPinchDistanceRef.current) * TOUCH_ZOOM_SENSITIVITY;
            
            const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
            
            updateZoom(scaleDelta, midX, midY);
            lastPinchDistanceRef.current = currentDist;
        }
    }, [transform, clampPosition, updateZoom]);

    const handleTouchEnd = useCallback(() => {
        isPanningRef.current = false;
        lastPinchDistanceRef.current = null;
        if (zoomContainerRef.current) zoomContainerRef.current.style.removeProperty('touch-action');
    }, []);

    const handleMouseDown = useCallback((event) => 
    {
        if (event.button !== 0) return; 
        isPanningRef.current = true;
        lastPanPositionRef.current = { x: event.clientX, y: event.clientY };
        zoomContainerRef.current.classList.toggle("dragging", true);
    }, []);

    const handleMouseMove = useCallback((event) => 
    {
        if (!isPanningRef.current || !lastPanPositionRef.current) return;
        
        const deltaX = event.clientX - lastPanPositionRef.current.x;
        const deltaY = event.clientY - lastPanPositionRef.current.y;
        lastPanPositionRef.current = { x: event.clientX, y: event.clientY };

        const newPosX = transform.posX + deltaX;
        const newPosY = transform.posY + deltaY;
        const clamped = clampPosition(newPosX, newPosY, transform.scale);
        setTransform(prev => ({ ...prev, posX: clamped.x, posY: clamped.y }));

    }, [transform, clampPosition]);

    const handleMouseUpOrLeave = useCallback(() => 
    {
        isPanningRef.current = false;
        //if (imageRef.current) imageRef.current.style.cursor = 'grab';
        zoomContainerRef.current.classList.toggle("dragging", false);
    }, []);

    useEffect(() =>
    {
        if (isZoomed) 
        {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    }, [isZoomed]);
    
    useEffect(() =>
    {
        const zoomContRef = zoomContainerRef.current;
        if(isZoomed || isImageCropper)
        {
            zoomContRef.addEventListener('wheel', handleWheel, {passive:false});
            zoomContRef.addEventListener('touchstart', handleTouchStart, { passive: false });
            zoomContRef.addEventListener('touchmove', handleTouchMove, { passive: false });
            zoomContRef.addEventListener('touchend', handleTouchEnd);
            zoomContRef.addEventListener('touchcancel', handleTouchEnd);
            zoomContRef.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUpOrLeave);
            window.addEventListener('mouseleave', handleMouseUpOrLeave);
            return () => 
            {
                zoomContRef.removeEventListener('wheel', handleWheel);
                zoomContRef.removeEventListener('touchstart', handleTouchStart);
                zoomContRef.removeEventListener('touchmove', handleTouchMove);
                zoomContRef.removeEventListener('touchend', handleTouchEnd);
                zoomContRef.removeEventListener('touchcancel', handleTouchEnd);
                zoomContRef.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUpOrLeave);
                window.removeEventListener('mouseleave', handleMouseUpOrLeave);
            }
        }
        
    }, [isZoomed, handleWheel, handleTouchEnd, handleTouchMove, handleTouchStart]);

    useEffect(() => 
    {
        currentSrcRef.current = src;
        if (!src) {
            setLoadedSrc(null);
            return;
        }

        // Immediately show small image so the modal instantly renders without a blank flash
        setLoadedSrc(smallSrc || src);
        isSwappingToLargeRef.current = false;

        // If a small placeholder was provided, preload the massive large version invisibly
        if (smallSrc && src !== smallSrc) {
            const img = new Image();
            img.onload = () => {
                if (currentSrcRef.current === src) {
                    isSwappingToLargeRef.current = true;
                    setLoadedSrc(src);
                }
            };
            img.src = src;
        }
    }, [src, smallSrc]);

    return (
        <div className={containerClasses}
            draggable="false"
            onClick={clickFunc}
            ref={zoomContainerRef}>
            
            <img src={loadedSrc} 
                alt={alt}
                draggable="false"
                ref={zoomedImageRef}
                onLoad={handleImageLoad}
                style={{
                    transform: `translate(${transform.posX}px, ${transform.posY}px) scale(${transform.scale})`,
                    transformOrigin: 'top left', 
                }}
            />
        </div>
    )
}

export default ImageZoom;
