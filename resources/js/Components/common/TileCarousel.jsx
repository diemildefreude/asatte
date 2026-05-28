import React, { useState, useEffect } from 'react';
import './Carousel.css';
import CarouselContainer from './CarouselContainer';
import Tile from './Tile';
import { Category } from '../../utils/helpers';

function TileCarousel({size, category=Category.Archive, userId=null, title="", excludePostId=null, initialPosts=null, fetchMethod=null})
{
    const carouselPostCount = 6;
    const [posts, setPosts] = useState(initialPosts || []);

    useEffect(() =>
    {
        // If server provided initialPosts, skip client fetch
        if (initialPosts && initialPosts.length > 0) return;
        if (!fetchMethod) return;
        const params = new URLSearchParams();
        const amount = carouselPostCount;
        params.append('amount', amount);
        params.append('start_id', 1);
        params.append('category', category);
        if(userId)
        {
            params.append('user_id', userId);
        }
        fetchMethod(params).then((data) =>
        {
            if(data.status === "no_more_posts")
            {
                return;
            }
            let fetchedPosts = data;
            if(excludePostId)
            {
                fetchedPosts = fetchedPosts.filter(post => post['id'] !== excludePostId);
            }
            setPosts(fetchedPosts);
        });
    }, [category, userId, setPosts])    
    
    return (
        posts?.length > 0 ?
        (
            <>
                <h2>{title}</h2>
                <CarouselContainer className="carousel-container-container"
                    size={size}
                    isTileCarousel={true}>
                {
                    ({isDragging, isDraggedPointerUp}) =>
                        posts.map((post) =>
                        (
                            <div className="slide" key={post.id}>
                                <Tile post={post}
                                    isSliderDragging={isDragging}
                                    isSliderDraggedPointerUp={isDraggedPointerUp}
                                />
                            </div>
                        )  
                    )
                }
                </CarouselContainer>   
            </>
        ):
        (
            <></>
        )
        
    );
}

export default TileCarousel;