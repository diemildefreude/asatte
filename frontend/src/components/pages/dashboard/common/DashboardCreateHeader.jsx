import { Link } from "react-router-dom";

function DashboardCreateHeader({headerText, createLink, isVerified=true})
{

    return(
        <div className="centered-header-box">
            <div className="centered-content no-margin">
                <h1>{headerText}</h1>
            </div>
            {                
                isVerified && (<Link
                    to={createLink} 
                    className="right-item link-button plus-button"
                >                    
                    +
                </Link>)
            }
        </div>
    );
}

export default DashboardCreateHeader;