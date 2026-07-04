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

function ImageZoom({ src, smallSrc, alt, isZoomed, clickFunc, outerContainerRef=null, isImageCropper=false, nextSrc, nextSmallSrc, prevSrc, prevSmallSrc, onNavigateNext, onNavigatePrev})
{      
    const zoomContainerRef = useRef(null);
    const zoomedImageRef = useRef(null);
    const slideContainerRef = useRef(null);
    const nextImgRef = useRef(null);
    const prevImgRef = useRef(null);
    const tempOverlayRef = useRef(null);
    const [loadedSrc, setLoadedSrc] = useState(null);
    const currentSrcRef = useRef(src);

    const [transform, setTransformState] = useState({ scale: 1, posX: 0, posY: 0 });
    const transformRef = useRef({ scale: 1, posX: 0, posY: 0 });
    const setTransform = useCallback((newTransform) => {
        if (typeof newTransform === 'function') {
            setTransformState(prev => {
                const updated = newTransform(prev);
                transformRef.current = updated;
                return updated;
            });
        } else {
            transformRef.current = newTransform;
            setTransformState(newTransform);
        }
    }, []);
    const [naturalSize, setNaturalSize] = useState(null);
    const [initialTransform, setInitialTransform] = useState(null);
    const isPanningRef = useRef(false);
    const lastPanPositionRef = useRef(null);
    const lastPinchDistanceRef = useRef(null);
    
    // Track drag distance to prevent click on release
    const hasDraggedRef = useRef(false);
    const dragDistanceRef = useRef(0);

    // Momentum tracking
    const lastMoveTimeRef = useRef(0);
    const lastMovePosRef = useRef({ x: 0, y: 0 });
    const velocityRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(null);

    const virtualPosXRef = useRef(0);
    const transitionDragXRef = useRef(0);

    const updateTransitionVisuals = useCallback((dragX) => {
        const width = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth : window.innerWidth;
        
        if (nextImgRef.current) {
            if (dragX < 0) {
                nextImgRef.current.style.transform = `translateX(${width + dragX}px)`;
                nextImgRef.current.style.opacity = 1;
                nextImgRef.current.style.display = 'block';
            } else {
                nextImgRef.current.style.display = 'none';
            }
        }

        if (prevImgRef.current) {
            if (dragX > 0) {
                prevImgRef.current.style.transform = `translateX(${-width + dragX}px)`;
                prevImgRef.current.style.opacity = 1;
                prevImgRef.current.style.display = 'block';
            } else {
                prevImgRef.current.style.display = 'none';
            }
        }

        if (slideContainerRef.current) {
            slideContainerRef.current.style.transform = `translateX(${dragX}px)`;
        }
    }, []);

    const containerClasses = isImageCropper ? "zoomed-image" : `zoomed-image ${!isZoomed ? 'hidden' : ''}`;
    const MIN_SCALE_FACTOR = 1; // Minimum scale relative to initial fit-to-screen scale
    const MAX_SCALE_FACTOR = 5; // Maximum scale relative to initial fit-to-screen scale
    const WHEEL_ZOOM_SENSITIVITY = 0.004;
    const TOUCH_ZOOM_SENSITIVITY = 0.01;
    const PAN_SENSITIVITY = 1; // For mouse wheel panning

    // Removed handleImageLoad since we calculate everything in the preloader

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

    const wheelTimeoutRef = useRef(null);


    const handleTouchStart = useCallback((event) => 
    {

        hasDraggedRef.current = false;
        dragDistanceRef.current = 0;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (!zoomContainerRef.current) return;
        
        virtualPosXRef.current = transformRef.current.posX;
        transitionDragXRef.current = 0;
        updateTransitionVisuals(0);

        if (event.touches.length === 1) { 
        isPanningRef.current = true;
        lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        
        lastMoveTimeRef.current = performance.now();
        lastMovePosRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        velocityRef.current = { x: 0, y: 0 };

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

        if (!zoomContainerRef.current) return;
        event.preventDefault(); 
        if (isPanningRef.current && event.touches.length === 1 && lastPanPositionRef.current) 
        {
            const deltaX = event.touches[0].clientX - lastPanPositionRef.current.x;
            const deltaY = event.touches[0].clientY - lastPanPositionRef.current.y;
            lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            
            dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
            if (dragDistanceRef.current > 10) {
                hasDraggedRef.current = true;
            }

            const now = performance.now();
            const dt = now - lastMoveTimeRef.current;
            if (dt > 0) {
                velocityRef.current = {
                    x: (event.touches[0].clientX - lastMovePosRef.current.x) / dt,
                    y: (event.touches[0].clientY - lastMovePosRef.current.y) / dt
                };
            }
            lastMovePosRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            lastMoveTimeRef.current = now;

            virtualPosXRef.current += deltaX;
            const newPosY = transformRef.current.posY + deltaY;
            const clamped = clampPosition(virtualPosXRef.current, newPosY, transformRef.current.scale);
            
            let overPan = virtualPosXRef.current - clamped.x;
            if (overPan < 0 && !nextSrc) overPan = 0;
            if (overPan > 0 && !prevSrc) overPan = 0;

            const maxWidth = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth * 0.8 : window.innerWidth * 0.8;
            if (overPan < -maxWidth) overPan = -maxWidth;
            if (overPan > maxWidth) overPan = maxWidth;
            
            virtualPosXRef.current = clamped.x + overPan;
            transitionDragXRef.current = overPan;
            updateTransitionVisuals(overPan);

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

    const startMomentum = useCallback(() => {
        const now = performance.now();
        if (now - lastMoveTimeRef.current > 100) {
            velocityRef.current = { x: 0, y: 0 };
        }

        let vx = velocityRef.current.x;
        let vy = velocityRef.current.y;
        
        const width = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth : window.innerWidth;
        const dragX = transitionDragXRef.current;
        
        const isSwipingNext = dragX < 0 && (dragX < -width * 0.2 || vx < -0.5);
        const isSwipingPrev = dragX > 0 && (dragX > width * 0.2 || vx > 0.5);

        let lastFrameTime = performance.now();

        const momentumLoop = (time) => {
            const dt = time - lastFrameTime;
            lastFrameTime = time;

            if (isSwipingNext || isSwipingPrev) {
                const targetX = isSwipingNext ? -width : width;
                transitionDragXRef.current += (targetX - transitionDragXRef.current) * 0.15;
                updateTransitionVisuals(transitionDragXRef.current);

                if (Math.abs(targetX - transitionDragXRef.current) > 2) {
                    animationFrameRef.current = requestAnimationFrame(momentumLoop);
                } else {
                    animationFrameRef.current = null;
                    if (isSwipingNext && onNavigateNext) onNavigateNext();
                    if (isSwipingPrev && onNavigatePrev) onNavigatePrev();
                }
            } else if (transitionDragXRef.current !== 0) {
                transitionDragXRef.current += (0 - transitionDragXRef.current) * 0.2;
                updateTransitionVisuals(transitionDragXRef.current);
                
                if (Math.abs(transitionDragXRef.current) > 1) {
                    animationFrameRef.current = requestAnimationFrame(momentumLoop);
                } else {
                    transitionDragXRef.current = 0;
                    updateTransitionVisuals(0);
                    animationFrameRef.current = null;
                }
            } else if (!isPanningRef.current && (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05)) {
                setTransform(prev => {
                    const newPosX = prev.posX + vx * dt;
                    const newPosY = prev.posY + vy * dt;
                    const clamped = clampPosition(newPosX, newPosY, prev.scale);
                    
                    if (newPosX !== clamped.x) vx = 0;
                    if (newPosY !== clamped.y) vy = 0;

                    return { ...prev, posX: clamped.x, posY: clamped.y };
                });

                vx *= 0.92;
                vy *= 0.92;

                if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
                    animationFrameRef.current = requestAnimationFrame(momentumLoop);
                } else {
                    animationFrameRef.current = null;
                }
            } else {
                animationFrameRef.current = null;
            }
        };
        animationFrameRef.current = requestAnimationFrame(momentumLoop);
        
    }, [clampPosition, onNavigateNext, onNavigatePrev, updateTransitionVisuals]);

    const handleTouchEnd = useCallback(() => {
        isPanningRef.current = false;
        lastPinchDistanceRef.current = null;
        if (zoomContainerRef.current) zoomContainerRef.current.style.removeProperty('touch-action');
        startMomentum();
    }, [startMomentum]);

    const handleMouseDown = useCallback((event) => 
    {
        if (event.button !== 0) return; 
        
        hasDraggedRef.current = false;
        dragDistanceRef.current = 0;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        isPanningRef.current = true;
        lastPanPositionRef.current = { x: event.clientX, y: event.clientY };
        
        virtualPosXRef.current = transformRef.current.posX;
        transitionDragXRef.current = 0;
        updateTransitionVisuals(0);

        lastMoveTimeRef.current = performance.now();
        lastMovePosRef.current = { x: event.clientX, y: event.clientY };
        velocityRef.current = { x: 0, y: 0 };

        zoomContainerRef.current.classList.toggle("dragging", true);
    }, []);

    const handleMouseMove = useCallback((event) => 
    {
        if (!isPanningRef.current || !lastPanPositionRef.current) return;
        
        const deltaX = event.clientX - lastPanPositionRef.current.x;
        const deltaY = event.clientY - lastPanPositionRef.current.y;
        lastPanPositionRef.current = { x: event.clientX, y: event.clientY };

        dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
        if (dragDistanceRef.current > 10) {
            hasDraggedRef.current = true;
        }

        const now = performance.now();
        const dt = now - lastMoveTimeRef.current;
        if (dt > 0) {
            velocityRef.current = {
                x: (event.clientX - lastMovePosRef.current.x) / dt,
                y: (event.clientY - lastMovePosRef.current.y) / dt
            };
        }
        lastMovePosRef.current = { x: event.clientX, y: event.clientY };
        lastMoveTimeRef.current = now;

        virtualPosXRef.current += deltaX;
        const newPosY = transformRef.current.posY + deltaY;
        const clamped = clampPosition(virtualPosXRef.current, newPosY, transformRef.current.scale);
        
        let overPan = virtualPosXRef.current - clamped.x;
        if (overPan < 0 && !nextSrc) overPan = 0;
        if (overPan > 0 && !prevSrc) overPan = 0;

        const maxWidth = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth * 0.8 : window.innerWidth * 0.8;
        if (overPan < -maxWidth) overPan = -maxWidth;
        if (overPan > maxWidth) overPan = maxWidth;
        
        virtualPosXRef.current = clamped.x + overPan;
        transitionDragXRef.current = overPan;
        updateTransitionVisuals(overPan);

        setTransform(prev => ({ ...prev, posX: clamped.x, posY: clamped.y }));

    }, [transform, clampPosition]);

    const handleMouseUpOrLeave = useCallback(() => 
    {
        isPanningRef.current = false;
        //if (imageRef.current) imageRef.current.style.cursor = 'grab';
        if (zoomContainerRef.current) zoomContainerRef.current.classList.toggle("dragging", false);
        startMomentum();
    }, [startMomentum]);

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
    }, [isZoomed, isImageCropper, updateZoom, clampPosition]);

    const handleClick = useCallback((e) => {
        if (hasDraggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            hasDraggedRef.current = false; // Reset for next valid click
            return;
        }
        if (clickFunc) clickFunc(e);
    }, [clickFunc]);

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
        
        if (transitionDragXRef.current !== 0 && zoomContainerRef.current) {
            const overlay = document.createElement('img');
            overlay.src = smallSrc || src;
            overlay.className = 'zoom-transition-img';
            overlay.style.display = 'block';
            overlay.style.transform = 'translateX(0px)';
            overlay.style.opacity = '1';
            overlay.style.zIndex = '10';
            overlay.draggable = false;
            zoomContainerRef.current.appendChild(overlay);
            
            if (tempOverlayRef.current) tempOverlayRef.current.remove();
            tempOverlayRef.current = overlay;
        }

        if (zoomedImageRef.current) zoomedImageRef.current.style.opacity = 0;
        if (slideContainerRef.current) slideContainerRef.current.style.transform = `translateX(0px)`;
        transitionDragXRef.current = 0;
        updateTransitionVisuals(0);

        if (!src) {
            setLoadedSrc(null);
            if (tempOverlayRef.current) {
                tempOverlayRef.current.remove();
                tempOverlayRef.current = null;
            }
            return;
        }

        setLoadedSrc(null);

        const targetSrc = smallSrc || src;
        const img = new Image();
        
        img.onload = () => {
            if (currentSrcRef.current === src) {
                const natSize = { width: img.naturalWidth, height: img.naturalHeight }; 
                const initialT = calculateInitialTransform(zoomContainerRef?.current, outerContainerRef?.current, natSize.width, natSize.height);
                
                setNaturalSize(natSize);
                setTransform(initialT);
                setInitialTransform(initialT);
                setLoadedSrc(targetSrc);

                if (smallSrc && src !== smallSrc) {
                    const largeImg = new Image();
                    largeImg.onload = () => {
                        if (currentSrcRef.current === src) {
                            const largeNatSize = { width: largeImg.naturalWidth, height: largeImg.naturalHeight }; 
                            const largeInitialT = calculateInitialTransform(zoomContainerRef?.current, outerContainerRef?.current, largeNatSize.width, largeNatSize.height);
                            
                            setNaturalSize((prevNatSize) => {
                                setTransform((prevTransform) => {
                                    if (!prevNatSize) return largeInitialT;
                                    const scaleRatio = largeNatSize.width / prevNatSize.width;
                                    return {
                                        scale: prevTransform.scale / scaleRatio,
                                        posX: prevTransform.posX,
                                        posY: prevTransform.posY
                                    };
                                });
                                return largeNatSize;
                            });
                            
                            setInitialTransform(largeInitialT);
                            setLoadedSrc(src);
                        }
                    };
                    largeImg.src = src;
                }

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (tempOverlayRef.current) {
                            tempOverlayRef.current.remove();
                            tempOverlayRef.current = null;
                        }
                    });
                });
            }
        };
        img.onerror = () => {
            if (tempOverlayRef.current) {
                tempOverlayRef.current.remove();
                tempOverlayRef.current = null;
            }
        };
        img.src = targetSrc;

    }, [src, smallSrc, updateTransitionVisuals, outerContainerRef, setTransform]);

    useEffect(() => {
        if (!isZoomed || !zoomContainerRef.current) return;

        const focusableElements = zoomContainerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            } else if (e.key === 'Escape') {
                clickFunc(e);
            } else if (e.key === 'ArrowRight' && onNavigateNext) {
                onNavigateNext();
            } else if (e.key === 'ArrowLeft' && onNavigatePrev) {
                onNavigatePrev();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isZoomed, clickFunc, onNavigateNext, onNavigatePrev]);

    return (
        <div className={containerClasses}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
            draggable="false"
            onClick={handleClick}
            ref={zoomContainerRef}>
            
            <div ref={slideContainerRef} className="zoom-slide-container">
                <img src={loadedSrc} 
                        alt={alt}
                        draggable="false"
                        ref={zoomedImageRef}
                        style={{
                            transform: `translate(${transform.posX}px, ${transform.posY}px) scale(${transform.scale})`,
                            transformOrigin: 'top left', 
                            opacity: loadedSrc ? 1 : 0
                        }}
                    />
            </div>

            {prevSrc && (
                <img src={prevSmallSrc || prevSrc} 
                     ref={prevImgRef}
                     className="zoom-transition-img"
                     alt="Previous"
                     draggable="false"
                />
            )}

            {nextSrc && (
                <img src={nextSmallSrc || nextSrc} 
                     ref={nextImgRef}
                     className="zoom-transition-img"
                     alt="Next"
                     draggable="false"
                />
            )}
            
            <button className="sr-only" onClick={(e) => { e.stopPropagation(); clickFunc(e); }}>Close gallery</button>
            {prevSrc && <button className="sr-only" onClick={(e) => { e.stopPropagation(); onNavigatePrev(); }}>Previous image</button>}
            {nextSrc && <button className="sr-only" onClick={(e) => { e.stopPropagation(); onNavigateNext(); }}>Next image</button>}

        </div>
    )
}

export default ImageZoom;
