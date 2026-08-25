import React, { useState, useRef, useMemo, useEffect } from 'react';
import './Carousel.css';
import CarouselContainer from './CarouselContainer';
import ImageZoom from './ImageZoom'; 
import { usePage } from '@inertiajs/react';
function ImageCarousel({size, post, title=""})
{
    const { props } = usePage();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false); 
    const slideRefs = useRef([]);
    const IMAGE_ROOT = `${props.app_url}/storage/images/uploaded/users/${post.user.username}/posts/${post.slug}/gallery`;


    slideRefs.current = [];
    const imageUrls = useMemo(() =>
    {
        try
        {
            return post?.gallery_image_urls ?? [];
        }
        catch
        {
            return [];
        }
    }, [post]);

    const prevZoomedRef = useRef(false);

    useEffect(() => {
        if (!isZoomed && prevZoomedRef.current) {
            slideRefs.current[currentSlideIndex]?.focus();
        }
        prevZoomedRef.current = isZoomed;
    }, [isZoomed, currentSlideIndex]);

    function handleClick(e)
    {      
        setIsZoomed(prev => !prev);
    }
    return (
        <>
        {
            imageUrls?.map && (<>
            <CarouselContainer className="carousel-container-container image-carousel"
                heading={title}
                size={size}
            >
            {
                ({ isDragging, isDraggedPointerUp, handleFocusIn }) => 
                    imageUrls.map((url, i) => (
                        <button type="button" className="slide" 
                            key={i} 
                            ref={el => slideRefs.current[i] = el}
                            aria-label={post.gallery_alts[i] || `Image ${i + 1} of ${imageUrls.length}`}
                            onFocus={() => setCurrentSlideIndex(i)}                    
                            onPointerUp={(e) => 
                            {
                                if (e.button !== 0) return; // Only left clicks/taps
                                if (isDragging.current || isDraggedPointerUp.current) 
                                {
                                    return;
                                }
                                setCurrentSlideIndex(i);
                                handleClick(e);
                            }}
                            onKeyDown={(e) =>
                            {
                                if(e.key === "Enter" || e.key === " ")
                                {
                                    e.preventDefault();
                                    setCurrentSlideIndex(i);
                                    handleClick();
                                    return;
                                }
                                if(e.key === "Escape")
                                {
                                    if(isZoomed)
                                    {
                                        handleClick();
                                    }
                                    return;
                                }
                                if(e.key === "ArrowLeft")
                                {
                                    const newInd = Math.max(0, currentSlideIndex - 1);
                                    setCurrentSlideIndex(newInd);
                                    slideRefs.current[newInd]?.focus();
                                    handleFocusIn();
                                    return;
                                }
                                if(e.key === "ArrowRight")
                                {
                                    const newInd = Math.min(imageUrls.length - 1, currentSlideIndex + 1);
                                    setCurrentSlideIndex(newInd);
                                    slideRefs.current[newInd]?.focus();
                                    handleFocusIn();
                                    return;
                                }
                            }
                            }>
                            <img src={`${IMAGE_ROOT}/small/${url}`} 
                                alt={post.gallery_alts[i]}
                                draggable="false"
                            />
                        </button>
                ))       
            }
            </CarouselContainer>        
            <ImageZoom src={isZoomed ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex]}` : null} 
                smallSrc={isZoomed ? `${IMAGE_ROOT}/small/${imageUrls[currentSlideIndex]}` : null}
                nextSrc={isZoomed && currentSlideIndex < imageUrls.length - 1 ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex + 1]}` : null}
                nextSmallSrc={isZoomed && currentSlideIndex < imageUrls.length - 1 ? `${IMAGE_ROOT}/small/${imageUrls[currentSlideIndex + 1]}` : null}
                prevSrc={isZoomed && currentSlideIndex > 0 ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex - 1]}` : null}
                prevSmallSrc={isZoomed && currentSlideIndex > 0 ? `${IMAGE_ROOT}/small/${imageUrls[currentSlideIndex - 1]}` : null}
                onNavigateNext={() => {
                    const newInd = Math.min(imageUrls.length - 1, currentSlideIndex + 1);
                    setCurrentSlideIndex(newInd);
                    slideRefs.current[newInd]?.focus();
                }}
                onNavigatePrev={() => {
                    const newInd = Math.max(0, currentSlideIndex - 1);
                    setCurrentSlideIndex(newInd);
                    slideRefs.current[newInd]?.focus();
                }}
                alt={post?.gallery_alts[currentSlideIndex] || `Image ${currentSlideIndex + 1} of ${imageUrls.length}`}
                clickFunc={handleClick}
                isZoomed={isZoomed}
            />
                </>)
            }
            
        </>        
    );
}

export default ImageCarousel;