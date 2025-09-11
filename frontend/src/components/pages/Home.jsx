import React, { useState, useEffect } from 'react';
import './Home.css';
import HeroTilesContainer from '../common/HeroTilesContainer';
import AutoloadTilesContainer from '../common/AutoloadTilesContainer';
import TileCarousel from '../common/TileCarousel';
import Layout from '../layout/Layout';
import { Category, getScreenSize, monitorScreenSize } from '../../utils/helpers';

function Home()
{    
    const [screenSize, setScreenSize] = useState(getScreenSize());

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);
    //console.log("ptd", postsToDisplay);

    return (
        <Layout>
        <div className="hero">
            <h1>asatte.io</h1>
            <p>the premier hub for internet art</p>
        </div>
        <div className="page-section">
            <HeroTilesContainer screenSize={screenSize} 
            category={Category.Archive}/>
        </div>
        <div className="page-section carousel">
            <h2>works from new users:</h2>
            <TileCarousel size="small" category={Category.Archive}/>
        </div>
        <div className="page-section carousel">
            <h2>netart news:</h2>
            <TileCarousel size="small" category={Category.News} />
        </div>
        <div className="page-section">
            <AutoloadTilesContainer screenSize={screenSize} 
            category={Category.Archive}/>
        </div>
        </Layout>
    );
}

export default Home;