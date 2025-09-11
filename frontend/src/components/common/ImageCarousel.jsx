import React, { useState, useRef, useMemo, useEffect } from 'react';
import './Carousel.css';
import CarouselContainer from './CarouselContainer';
import ImageZoom from './ImageZoom'; 
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ImageCarousel({size, post})
{
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false); 
    const slideRefs = useRef([]);
    const IMAGE_ROOT = `${BACKEND_URL}/storage/images/uploaded/${post.user.username}/posts/${post.post_url}/gallery`;

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

    function handleClick(e)
    {      
        setIsZoomed(prev => !prev);
    }
    return (
        <>
        {
            imageUrls?.map && (<>
            <CarouselContainer className="carousel-container-container image-carousel"
            size={size}>
            {
                ({ isDragging, isDraggedPointerUp, handleFocusIn }) => 
                    imageUrls.map((url, i) => (
                        <div className="slide" 
                            key={i} 
                            ref={el => slideRefs.current[i] = el}
                            tabIndex="0"
                            onFocus={() => setCurrentSlideIndex(i)}                    
                            onClick={(e) => 
                            {
                                if (isDragging.current || isDraggedPointerUp.current) 
                                {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                }
                                setCurrentSlideIndex(i);
                                handleClick(e);
                            }}
                            onKeyDown={(e) =>
                            {
                                if(e.key === "Enter")
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
                        </div>
                ))       
            }
            </CarouselContainer>        
            <ImageZoom src={isZoomed ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex]}` : null} 
                alt=""
                clickFunc={handleClick}
                isZoomed={isZoomed}
            />
                </>)
            }
            
        </>        
    );
}

export default ImageCarousel;