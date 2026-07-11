import React from 'react';
import './Carousel.css';
import CarouselContainer from './CarouselContainer';
import Tile from './Tile';

function TileCarousel({ size, title = "", posts = []})
{
    return (
        posts?.length > 0 ?
        (
            <>
                {title && <h2>{title}</h2>}
                <CarouselContainer className={"carousel-container-container"}
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
        ) : null
    );
}

export default TileCarousel;