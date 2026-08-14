import PageHead from '../Components/layout/PageHead';
import React, { useState, useEffect } from 'react';
import './Home.css';
import HeroTilesContainer from '../Components/common/HeroTilesContainer';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import TileCarousel from '../Components/common/TileCarousel';
import Layout from '../Components/layout/Layout';
import { usePage } from '@inertiajs/react';
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from '../utils/helpers';

function Home({ heroPosts = [], carouselArchive = [], carouselNews = [], carouselFollowing = [], archivePosts = [] })
{        
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const { props } = usePage();
    const directory = `${props.app_url}/images/`;

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return (
        <>
        <PageHead title="home"/>
        <div className="hero">
            <div className='hero-text-container'>
                <h1>{`asatte.io`}</h1>
                <p>the premier hub for internet art</p>     
            </div>
            <div className='hero-logo-container'>
                <img className="hero-logo" src={directory + "logo/blue.svg"} alt="asatte logo" />
            </div>                   
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
            <TileCarousel size="small" title="newest works:" posts={carouselArchive} />
        </div>
        {carouselFollowing && carouselFollowing.length > 0 && (
            <div className="page-section carousel">
                <TileCarousel size="small" title="users you follow:" posts={carouselFollowing} />
            </div>
        )}
        {carouselNews && carouselNews.length > 0 && (
            <div className="page-section carousel">
                <TileCarousel size="small" title="netart news:" posts={carouselNews} />
            </div>
        )}
        <div className="page-section">
            <h2 className='big-title centered-content no-margin padded'>explore</h2>
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