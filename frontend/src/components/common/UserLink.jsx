import './Tile.css';
import { Link } from 'react-router-dom';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserLink({user, onClick, additionalClasses, url})
{
    const target = url ?? `/user/${user.id}`;
    const avatar = user?.avatar ? `${BACKEND_URL}/storage/images/uploaded/${user.username}/avatar/thumb/${user?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;
    return (   
        <>
        {
            user ? 
            (                
                <Link to={target} className={`user-link ${additionalClasses}`} draggable="false" onClick={onClick}>
                    <span className="avatar-container">
                        <img className="round-image" src={avatar} 
                            alt={`${user.username}'s avatar`} 
                            draggable="false"
                        />
                    </span> 
                    <span>{user.username}</span>
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