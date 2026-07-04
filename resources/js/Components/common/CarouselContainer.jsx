import React, { useEffect, useRef, useCallback } from 'react';
import './Carousel.css';

class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
        
    distanceTo = (point) =>
    {
        const distance = Math.sqrt((Math.pow(point.x-this.x,2))+(Math.pow(point.y-this.y,2)));
        return distance;
    }        
}

function CarouselContainer({size, className, children})
{
    const sliderContainerRef = useRef(null);
    const innerSliderRef = useRef(null); 
    const isDraggingRef = useRef(false);
    const isDraggedPointerUpRef = useRef(false);
    const isPointerDownRef = useRef(false);
    const sliderEndLeftRef = useRef(null);
    const sliderEndRightRef = useRef(null);
    const startPosRef = useRef(new Point(0,0));
    const currentTranslateXRef = useRef(0); // Stores the current horizontal position (translateX value)
    const initialTranslateXRef = useRef(0); // Stores the translateX value when the drag starts
    const mouseDownTargetRef = useRef(null);
    const distanceThreshold = 5;

    const lastMoveTimeRef = useRef(0);
    const lastMoveXRef = useRef(0);
    const velocityRef = useRef(0);
    const animationFrameRef = useRef(null);

    const checkBoundary = useCallback((x) =>
    {
        if (!innerSliderRef.current || !sliderContainerRef.current) return x;
        const innerW = innerSliderRef.current.offsetWidth;
        const outerW = sliderContainerRef.current.offsetWidth;
        if(innerW < outerW)
        {
            return 0;
        }
        const innerSliderMax = innerW - outerW;
        let newTranslateX = Math.min(x, 0);
        newTranslateX = Math.max(newTranslateX, -innerSliderMax);
        return newTranslateX;
    }, []);

    const updateSliderEnds = useCallback(() =>
    {        
        if(!innerSliderRef.current || !sliderContainerRef.current)
        {return;}
        const FADE_WIDTH = 200;
        const currentX = currentTranslateXRef.current;
        const opacityLeft = Math.min(-currentX / FADE_WIDTH, 1.0); //if currentX == 0, opacity = 1;

        const sliderLeft = sliderEndLeftRef.current;
        sliderLeft.style.setProperty("--left-opacity", opacityLeft);

        const innerW = innerSliderRef.current.offsetWidth;
        const outerW = sliderContainerRef.current.offsetWidth;
        const innerSliderMax = innerW - outerW; // 264
        const rightFadePoint = innerSliderMax - FADE_WIDTH; // 164
        const opacityRight = 1.0 - Math.max((-currentX - rightFadePoint) / FADE_WIDTH, 0.0); // 164 - 164 = 0 || 264 - 164 = 100

        const sliderRight = sliderEndRightRef.current;
        sliderRight.style.setProperty("--right-opacity", opacityRight);

    },[])

    useEffect(() =>
    {
        updateSliderEnds();
        window.addEventListener('resize', updateSliderEnds);
        
        let resizeObserver = null;
        if (innerSliderRef.current) {
            resizeObserver = new ResizeObserver(() => {
                updateSliderEnds();
            });
            resizeObserver.observe(innerSliderRef.current);
        }

        return () => 
        {
            window.removeEventListener('resize', updateSliderEnds);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    },[updateSliderEnds]);

    const handleFocusIn = useCallback(() =>
    {
        const focusedEl = document.activeElement;

        if (!innerSliderRef.current || !sliderContainerRef.current || !focusedEl || !innerSliderRef.current.contains(focusedEl)) {
            return;
        }

        const sliderRect = sliderContainerRef.current.getBoundingClientRect();
        const focusRect = focusedEl.getBoundingClientRect();

        // Calculate overflow
        const overLeft = focusRect.left < sliderRect.left;
        const overRight = focusRect.right > sliderRect.right;

        let deltaX = 0;

        if (overLeft) 
        {
            deltaX = focusRect.left - sliderRect.left;
        } 
        else if (overRight) 
        {
            deltaX = focusRect.right - sliderRect.right;
        }

        if (deltaX !== 0) {
            currentTranslateXRef.current -= deltaX;
            currentTranslateXRef.current = checkBoundary(currentTranslateXRef.current);
            innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
        }
    }, [checkBoundary]);

    const renderContent = typeof children === 'function'
        ? children({
            isDragging: isDraggingRef,
            isDraggedPointerUp: isDraggedPointerUpRef,
            handleFocusIn: handleFocusIn
        })
        : children;

    const handlePointerDown = useCallback((e) =>
    {
        if (animationFrameRef.current) 
        {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        isPointerDownRef.current = true;
        isDraggedPointerUpRef.current = false;
        isDraggingRef.current = false;

        if (sliderContainerRef.current) sliderContainerRef.current.classList.add('dragging');
        if (innerSliderRef.current) innerSliderRef.current.classList.add('dragging');

        startPosRef.current = new Point(e.pageX,e.pageY);
        initialTranslateXRef.current = currentTranslateXRef.current;
        mouseDownTargetRef.current = e.target;
        
        lastMoveXRef.current = e.pageX;
        lastMoveTimeRef.current = performance.now();
        velocityRef.current = 0;
    }, []);

    const handlePointerMove = useCallback((e) => 
    {
        if(!isPointerDownRef.current || !sliderContainerRef.current)
        {
            return;
        }                
        let isDraggingCurrent = isDraggingRef.current;
        const diff = startPosRef.current.distanceTo(new Point(e.pageX, e.pageY));
        if (!isDraggingRef.current && diff > distanceThreshold) 
        {
            isDraggingRef.current = true;
            isDraggingCurrent = true;
            if(mouseDownTargetRef.current && mouseDownTargetRef.current.tagName !== 'A')
            {
                e.preventDefault(); // Prevent default browser drag behavior
                e.stopPropagation();
            }
        }
        if(!isDraggingCurrent)
        {
            return;
        }
        isDraggedPointerUpRef.current = true;
        e.preventDefault(); // Prevent default browser drag behavior
        e.stopPropagation();

        const now = performance.now();
        const dt = now - lastMoveTimeRef.current;
        if (dt > 0) {
            velocityRef.current = (e.pageX - lastMoveXRef.current) / dt;
        }
        lastMoveXRef.current = e.pageX;
        lastMoveTimeRef.current = now;

        const deltaX = e.pageX - startPosRef.current.x; // How much mouse has moved horizontally
        let newTranslateX = initialTranslateXRef.current + deltaX;
        newTranslateX = checkBoundary(newTranslateX);
        currentTranslateXRef.current = newTranslateX;
        innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
        updateSliderEnds();
    }, [checkBoundary]);

    const handlePointerUp = useCallback(() => 
    {
        isPointerDownRef.current = false;
        
        if (sliderContainerRef.current) sliderContainerRef.current.classList.remove('dragging');
        if (innerSliderRef.current) innerSliderRef.current.classList.remove('dragging'); 

        const now = performance.now();
        if (now - lastMoveTimeRef.current > 100) {
            // User held the pointer still before releasing
            velocityRef.current = 0;
        }

        if (Math.abs(velocityRef.current) > 0.1 && isDraggingRef.current) 
        {
            let v = velocityRef.current;
            
            let lastFrameTime = performance.now();

            const momentumLoop = (time) => 
            {
                if (!innerSliderRef.current || !sliderContainerRef.current) return;
                
                const dt = time - lastFrameTime;
                lastFrameTime = time;

                if (!isPointerDownRef.current && Math.abs(v) > 0.05) 
                {
                    let newTranslateX = currentTranslateXRef.current + v * dt;
                    let boundedX = checkBoundary(newTranslateX);
                    
                    // Stop early if hitting boundary
                    if (newTranslateX !== boundedX) 
                    {
                        v = 0;
                    }
                    
                    currentTranslateXRef.current = boundedX;
                    innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
                    updateSliderEnds();

                    v *= 0.92; // Friction

                    if (Math.abs(v) > 0.05) 
                    {
                        animationFrameRef.current = requestAnimationFrame(momentumLoop);
                    } 
                    else 
                    {
                        animationFrameRef.current = null;
                        isDraggingRef.current = false;
                    }
                } 
                else 
                {
                    animationFrameRef.current = null;
                    isDraggingRef.current = false;
                }
            };
            animationFrameRef.current = requestAnimationFrame(momentumLoop);
        } 
        else 
        {
            isDraggingRef.current = false;
        }
    }, [checkBoundary]);

    useEffect(() =>
    {        
        const containerElement = sliderContainerRef.current;
        if (!containerElement) return;
        containerElement.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointermove', handlePointerMove);

        return () => 
        {
            containerElement.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointermove', handlePointerMove);
        };
    }, [handlePointerDown, handlePointerMove, handlePointerUp]);

    useEffect(() =>
    {
        const sliderContRef = sliderContainerRef.current;
        if(!sliderContRef)
        {
            return;
        }
        const handleWheel = (e) =>
        {
            if(Math.abs(e.deltaY) > Math.abs(e.deltaX))
            {
                return;
            }

            if(innerSliderRef.current.style.left === "")
            {
                innerSliderRef.current.style.left = "0px";
            }
            //const posStr = innerSliderRef.current.style.left;
            const oldPos = currentTranslateXRef.current;//Number(posStr.substring(0, posStr.length - 2));
            //innerSliderRef.current.style.left = `${e.pageX - innerStartXRef.current}px`;
            let newPos = oldPos - e.deltaX;
            newPos = checkBoundary(newPos);
            currentTranslateXRef.current = newPos;
            innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
            
            updateSliderEnds();
            e.stopPropagation();
            e.preventDefault();
        };
        sliderContRef.addEventListener('wheel', handleWheel, {passive: false});

        return () => 
        {
            if(sliderContRef)
            {
                sliderContRef.removeEventListener('wheel', handleWheel);
            }
        }
    },[]);
    
    useEffect(() =>
    {
        const inner = innerSliderRef.current;
        if (inner)
        {
            inner.addEventListener('focusin', handleFocusIn);
        }

        return () =>
        {
            if (inner)
            {
                inner.removeEventListener('focusin', handleFocusIn);
            }
        };
    }, [handleFocusIn]);

    
    

    return (
        <div className={className}>
            <div className={"carousel-container " + size}
                tabIndex="0" role="region" aria-label=""
                ref={sliderContainerRef}
            >
                <div className="slider-container gallery-slider">            
                    <div className="inner-slider" ref={innerSliderRef}>
                        {renderContent} 
                    </div>                
                </div>
                <div className="slider-end-left" ref={sliderEndLeftRef}></div>
                <div className="slider-end-right" ref={sliderEndRightRef}></div>
            </div>
        </div>       
    );

}

export default CarouselContainer;