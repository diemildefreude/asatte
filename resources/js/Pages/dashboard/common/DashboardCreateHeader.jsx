import PageHead from '../../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';

function DashboardCreateHeader({headerText, createLink, isVerified=true})
{

    return(
        <div className="centered-header-box">
            <PageHead title="Dashboard Create Header" />
            <div className="centered-content no-margin">
                <h1>{headerText}</h1>
            </div>
            {                
                isVerified && ( 
                <div className="right-item">
                    <Link href={createLink} 
                        className="plus-button link-button"
                    >                    
                        +
                    </Link>
                </div>                
                )
            }
        </div>
    );
}

export default DashboardCreateHeader;