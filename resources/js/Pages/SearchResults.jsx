import React, { useEffect, useState } from 'react';
import Layout from '../Components/layout/Layout';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import { getScreenSize, Category, FetchOrder } from '../utils/helpers';
import PageHead from '../Components/layout/PageHead';

function SearchResults({ searchTerm = '', searchPosts = [] })
{
    const [screenSize, setScreenSize] = useState(getScreenSize());

    // Search results are provided via Inertia prop `searchPosts`.

    // const location = useLocation();
    // const [searchTerm, setSearchTerm] = useState(location.state?.query);



    // useEffect(() =>
    // {

    //     setSearchTerm(location.state?.query);
    // },[location.state]);

    return (
        <>
            <PageHead title="Search Results" />
            <div className="page-section">
                <h1 className='padded centered-content'>
                    {
                        searchTerm 
                        ? `search results for "${searchTerm}"` 
                        : "Please enter a search term."
                    }
                </h1>
                <AutoloadTilesContainer 
                    key={searchTerm}
                    screenSize={screenSize} 
                    category={Category.Archive}
                    fetchOrder={FetchOrder.Random}
                    searchTerm={searchTerm}
                    initialPosts={searchPosts}
                    isSearch={true}
                    partialProp={'searchPosts'}
                />
            </div>
        </>
    );
}


SearchResults.layout = page => <Layout>{page}</Layout>;
export default SearchResults;