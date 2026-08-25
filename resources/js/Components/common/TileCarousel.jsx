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
                <CarouselContainer className={"carousel-container-container"}
                    heading={title}
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