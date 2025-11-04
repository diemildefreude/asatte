import { Link } from "react-router-dom";
import './Users.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserCircle({user})
{
    const avatar = user?.avatar ? `${BACKEND_URL}/storage/images/uploaded/${user.username}/avatar/small/${user?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;

        //console.log("userCircle?!", user);
    
        return (
        user && (
        <Link 
            to={`/${user.username}`}
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