import './Tile.css';
import './UserLink.css';
import { Link, router, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

function UserLink({user, readOnly=false, returnUser=false, onClick=null, additionalClasses="", url=null})
{   
    const { props } = usePage();
    const target = url ?? `/${user.username}/profile`;
    //console.log("url", url);
    //console.log("target", target);
    const avatar = user?.avatar ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/thumb/${user?.avatar}` 
        : `${props.app_url}/storage/images/defaults/avatar.webp?v=1`;
        
    let classes = `user-link ${additionalClasses}`;
    classes = readOnly ? classes + " read-only" : classes;

    const handleOnClickOverride = useCallback((e) => 
    { 
        if(returnUser)
        {
            e.preventDefault(); 
            onClick(user);
        } else {
            onClick(e);
        }
    },[onClick, user, returnUser]);

    return (   
        <>
        {
            user ? 
            (                
                <Link href={target} 
                    className={classes} 
                    draggable="false" 
                    onClick={onClick ? handleOnClickOverride : undefined}
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