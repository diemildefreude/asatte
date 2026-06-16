import './Tile.css';
import './UserLink.css';
import { Link, router, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

function UserLink({user, readOnly=false, onClick=null, additionalClasses="", url=null, returnUser=false})
{   
    const { props } = usePage();
    
    const target = url ?? `/${user?.username}/profile`;
    
    const avatar = user?.avatar ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/thumb/${user?.avatar}` 
        : `${props.app_url}/storage/images/defaults/avatar.webp?v=1`;
        
    let classes = `user-link ${additionalClasses}`;
    classes = readOnly ? classes + " read-only" : classes;

    const handleOnClickOverride = useCallback((e) => 
    { 
        if(onClick && returnUser)
        {
            onClick(e, user);
        }
        else if(onClick)
        {
            onClick(e);
        }
    },[onClick, user, readOnly, returnUser]);

    return (   
        <>
        {
            user ? 
            (                
                <Link href={target} 
                    className={classes} 
                    draggable="false" 
                    onClick={handleOnClickOverride}
                >
                    <span className="avatar-container">
                        <img className="round-image" src={avatar} 
                            alt={`RipplyScottttttttttttttttttttttttttttttttt's avatar`} 
                            draggable="false"
                        />
                        <span className="notice-light small"></span>
                    </span> 
                    <span className='username'>{user.username}</span>
                </Link>
            ) :
            (
                <p className='loading bold'><em>deleted user</em></p>
            )
        }     
        </>
    );
}

export default UserLink;