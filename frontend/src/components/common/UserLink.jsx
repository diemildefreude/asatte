import './Tile.css';
import './UserLink.css';
import { Link } from 'react-router-dom';
import { useCallback } from 'react';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserLink({user, readOnly=false, returnUser=false, onClick=null, additionalClasses="", url})
{   
    const target = url ?? `/${user.username}/profile`;
    const avatar = user?.avatar ? `${BACKEND_URL}/storage/images/uploaded/users/${user.username}/avatar/thumb/${user?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;
        
    let classes = `user-link ${additionalClasses}`;
    classes = readOnly ? classes + " read-only" : classes;

    const handleOnClickOverride = useCallback((e) => 
    { 
        e.preventDefault(); 
        //if(returnUser)
        //{
            onClick(user);
        //}
        //onClick(e);
    },[onClick, user]);

    return (   
        <>
        {
            user ? 
            (                
                <Link 
                    to={target} 
                    className={classes} 
                    draggable="false" 
                    onClick={onClick ? handleOnClickOverride : null}
                >
                    <span className="avatar-container">
                        <img className="round-image" src={avatar} 
                            alt={`RipplyScottttttttttttttttttttttttttttttttt's avatar`} 
                            draggable="false"
                        />
                    </span> 
                    <span className='username'>{user.username}</span>
                </Link>
            ) :
            (
                <p className='loading'>loading user...</p>
            )
        }     
        </>
    );
}

export default UserLink;