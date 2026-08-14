import { Link, router, usePage } from '@inertiajs/react';
import './Users.css';

function UserCircle({user})
{
    const { props } = usePage();
    const avatar = user?.avatar ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/small/${user?.avatar}` 
        : `${props.app_url}/images/defaults/avatar.webp?v=1`;


    
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