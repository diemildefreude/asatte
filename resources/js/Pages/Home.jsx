import PageHead from '../Components/layout/PageHead';
import React, { useState, useEffect } from 'react';
import './Home.css';
import HeroTilesContainer from '../Components/common/HeroTilesContainer';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import TileCarousel from '../Components/common/TileCarousel';
import Layout from '../Components/layout/Layout';
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from '../utils/helpers';

function Home({ heroPosts = [], carouselArchive = [], carouselNews = [], archivePosts = [] })
{    
    const [screenSize, setScreenSize] = useState(getScreenSize());

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return (
        <>
        <PageHead title="home"/>
        <div className="hero">
            <h1>asatte.io</h1>
            <p>the premier hub for internet art</p>
        </div>
        <div className="page-section top-tile-grid">
            <HeroTilesContainer 
                screenSize={screenSize} 
                category={Category.Archive}                
                fetchOrder={FetchOrder.Random}
                initialPosts={heroPosts}
            />
        </div>
        <div className="page-section carousel">
            <TileCarousel size="small" category={Category.Archive} title="works from new users:" initialPosts={carouselArchive} />
        </div>
        <div className="page-section carousel">
            <TileCarousel size="small" category={Category.News} title="netart news:" initialPosts={carouselNews} />
        </div>
        <div className="page-section">
            <h1 className='centered-content no-margin padded'>explore</h1>
            <AutoloadTilesContainer 
                screenSize={screenSize} 
                category={Category.Archive}
                fetchOrder={FetchOrder.Random}
                initialPosts={archivePosts}
                partialProp={'archivePosts'}
            />
        </div>
        </>
    );
}


Home.layout = page => <Layout>{page}</Layout>;
export default Home;