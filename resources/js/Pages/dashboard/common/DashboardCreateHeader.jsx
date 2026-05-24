import {  Link, router, usePage , Head } from '@inertiajs/react';

function DashboardCreateHeader({headerText, createLink, isVerified=true})
{

    return(
        <div className="centered-header-box">
            <Head title="Dashboard Create Header" />
            <div className="centered-content no-margin">
                <h1>{headerText}</h1>
            </div>
            {                
                isVerified && (<Link href={createLink} 
                    className="right-item link-button plus-button"
                >                    
                    +
                </Link>)
            }
        </div>
    );
}

export default DashboardCreateHeader;