import React, { useState, useEffect } from 'react';
import './Carousel.css';
import CarouselContainer from './CarouselContainer';
import Tile from './Tile';
import { useAuth } from '../../contexts/AuthContext';

function TileCarousel({size, category=null, userId=null})
{
    //const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    
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
            console.log("data", data, typeof data);
            setPosts(data);
        });
    }, [category, userId, setPosts])    

    
    return (
        <CarouselContainer className="carousel-container-container"
            size={size}
            isTileCarousel={true}>
        {
            posts && (
            ({isDragging, isDraggedPointerUp}) =>
                posts.map((post) =>
                (
                    <div className="slide" key={post.id}>
                        <Tile post={post}
                            isSliderDragging={isDragging}
                            isSliderDraggedPointerUp={isDraggedPointerUp}
                        />
                    </div>
                ))  
            )
        }
        </CarouselContainer>        
    );
}

export default TileCarousel;