import React, { useEffect, useState } from 'react';
import Layout from '../layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileItem from '../common/ProfileItem';
import RichTextEditor from '../common/RichTextEditor';
import './DashboardProfile.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserProfile()
{
    const { fetchUser } = useAuth();
    const { username} = useParams();
    const [user, setUser] = useState();
    const navigate = useNavigate();

    const avatar = user?.avatar ? `${BACKEND_URL}/storage/images/uploaded/${username}/avatar/small/${user?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;

    useEffect(() => 
    {
        fetchUser(username).then((data) =>
        {
            setUser(data);
            console.log(data);
        })
        .catch((err) =>
        {
            const status = err.response?.status || err.status;
            console.log("err", status);
            if(status === 404)
            {
                console.log("navigating away...");
                navigate('/not-found');
            }
        });  
    },[username, setUser, navigate]);

    return (
    <Layout>        
        <div className="heading-profile-container public-profile">
            <h2 className='centered-content'>profile</h2>
            {
                user ? (
                    <div className="profile-boxes-container">
                        <div className="main-info-box sticky">
                            <div className="avatar-section">
                                <div className="profile-avatar-container">
                                    <img src={avatar} alt="" className="round-image" />
                                </div>
                            </div>
                            <div className="info-section">      
                                <ProfileItem 
                                    name="username"
                                    value={username}
                                    isPublic={true}                        
                                />
                                <ProfileItem
                                    name="website"
                                    value={user.website}
                                    isPublic={true}
                                    isLink={true}
                                />
                                <ProfileItem
                                    name="location"
                                    value={user.location}
                                    isPublic={true}
                                />       
                            </div>        
                        </div>
                        <div className="rte-container">
                            <div className="centered-header-box">       
                                <div className="centered-item">
                                    <h3>bio</h3>                    
                                </div>
                            </div>                
                            <RichTextEditor
                                readOnly={true}
                                value={user.bio}
                            />           
                        </div>
                    </div>
                ):
                (
                    <p className="centered-content"> loading user...</p>
                )
            }
        </div>
    </Layout>);
}

export default UserProfile;