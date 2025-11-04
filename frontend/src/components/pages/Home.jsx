import React, { useState, useEffect } from 'react';
import './Home.css';
import HeroTilesContainer from '../common/HeroTilesContainer';
import AutoloadTilesContainer from '../common/AutoloadTilesContainer';
import TileCarousel from '../common/TileCarousel';
import Layout from '../layout/Layout';
import { Category, FetchOrder, getScreenSize, monitorScreenSize } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

function Home()
{    
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {fetchPosts} = useAuth();

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, [setScreenSize]);

    return (
        <Layout>
        <div className="hero">
            <h1>asatte.io</h1>
            <p>the premier hub for internet art</p>
        </div>
        <div className="page-section top-tile-grid">
            <HeroTilesContainer 
                screenSize={screenSize} 
                category={Category.Archive}                
                fetchOrder={FetchOrder.Random}
            />
        </div>
        <div className="page-section carousel">
            <TileCarousel size="small" category={Category.Archive} title="works from new users:"/>
        </div>
        <div className="page-section carousel">
            <TileCarousel size="small" category={Category.News} title="netart news:"/>
        </div>
        <div className="page-section">
            <AutoloadTilesContainer 
                screenSize={screenSize} 
                category={Category.Archive}
                fetchMethod={fetchPosts}
                fetchOrder={FetchOrder.Random}
            />
        </div>
        </Layout>
    );
}

export default Home;