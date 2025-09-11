import React from 'react';
import './Layout.css';
import Header from './Header';

function Layout({children})
{
    return (
    <>
        <Header></Header>
        <div className="content">
            {children}
        </div>
        </>
    );
}

export default Layout;