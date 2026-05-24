import React, { useEffect, useState } from 'react';
import Layout from '../Components/layout/Layout';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import { getScreenSize, Category, FetchOrder } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';
import {  Link, router, usePage , Head } from '@inertiajs/react';

function SearchResults()
{
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const {searchPosts} = useAuth();
    const [searchParams] = useSearchParams();
    const currentSearchTerm = searchParams.get('q') || "";

    // const location = useLocation();
    // const [searchTerm, setSearchTerm] = useState(location.state?.query);

    //console.log("search query?", searchTerm);

    // useEffect(() =>
    // {
    //     console.log("state change", location.state?.query);
    //     setSearchTerm(location.state?.query);
    // },[location.state]);

    return (
        <Layout>
            <Head title="Search Results" />
            <div className="page-section">
                <h3 className='padded centered-content'>
                    {
                        currentSearchTerm 
                        ? `search results for "${currentSearchTerm}"` 
                        : "Please enter a search term."
                    }
                </h3>
                <AutoloadTilesContainer 
                    key={currentSearchTerm}
                    screenSize={screenSize} 
                    category={Category.Archive}
                    fetchMethod={searchPosts}
                    fetchOrder={FetchOrder.Random}
                    searchTerm={currentSearchTerm}
                    isSearch={true}
                />
            </div>
        </Layout>
    );
}

export default SearchResults;