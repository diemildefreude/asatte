import { Link, router, usePage } from '@inertiajs/react';
import './Users.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserCircle({user})
{
    const avatar = user?.avatar ? `${BACKEND_URL}/storage/images/uploaded/users/${user.username}/avatar/small/${user?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;

        //console.log("userCircle?!", user);
    
        return (
        user && (
        <Link href={`/${user.username}`}
            className="user-circle"
        >            
            <img 
                src={avatar} 
                alt={`${user.username}'s profile image`} 
                className="round-image" 
            />
            <span>{user.username}</span>
        </Link>    
        )
    )
}

export default UserCircle;