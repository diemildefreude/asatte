import React, { useState, useEffect } from 'react';
import './Carousel.css';
import CarouselContainer from './CarouselContainer';
import Tile from './Tile';
import { useAuth } from '../../contexts/AuthContext';

function TileCarousel({size, category=null, userId=null, title="", excludePostId=null})
{
    const carouselPostCount = 6;
    const [posts, setPosts] = useState([]);
    const {fetchPosts} = useAuth();

    useEffect(() =>
    {
        const params = new URLSearchParams();
        const amount = carouselPostCount;
        params.append('amount', amount);
        params.append('start_id', 1);
        params.append('category', category);
        if(userId)
        {
            params.append('user_id', userId);
        }
        fetchPosts(params).then((data) =>
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