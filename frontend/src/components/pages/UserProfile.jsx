import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../layout/Layout';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileItem from '../common/ProfileItem';
import RichTextEditor from '../common/RichTextEditor';
import LimitedTilesContainer from '../common/LimitedTilesContainer';
import './DashboardProfile.css';
import { FetchOrder, getErrorMessage, getScreenSize, monitorScreenSize } from '../../utils/helpers';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserProfile()
{
    const { fetchUser, fetchPosts, user, toggleFollow } = useAuth();
    const { username } = useParams();
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const [profileUser, setProfileUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();

    //console.log("profileUser?", profileUser);

    const avatar = profileUser?.avatar ? `${BACKEND_URL}/storage/images/uploaded/${username}/avatar/small/${profileUser?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);

    useEffect(() => 
    {
        setProfileUser(null);      // reset previous user data
        setIsFollowing(false);
        setError('');
        setSuccess('');
        fetchUser(username).then((data) =>
        {
            setProfileUser(data);
            setIsFollowing(data.is_following);
            //console.log("data?", data);
            setSuccess(data.message);
            setIsSubmitting(false);
        })
        .catch((err) =>
        {
            const status = err.response?.status || err.status;
            console.log("err", status);
            setError(getErrorMessage(err));
            if(status === 404)
            {
                console.log("navigating away...");
                navigate('/not-found');
            }
            setIsSubmitting(false);
        });
    },[username, setProfileUser, setIsFollowing, setError, 
        setSuccess, navigate, setIsSubmitting]);

    const handleFollowToggle = useCallback(() =>
    {
        setIsSubmitting(true);
        toggleFollow(profileUser.id)
        .then((data) =>
        {
            //console.log("follow data", data);
            setIsFollowing(data.is_following);
            setSuccess(data.message);
            setIsSubmitting(false);
        })
        .catch((err) =>
        {
            console.log(err);
            setError(getErrorMessage(err));
            setIsSubmitting(false);
        })
    },[profileUser, setIsSubmitting, toggleFollow, setIsFollowing, setError, setSuccess]);

    return (
    <Layout>        
        <div className="heading-profile-container public-profile">
            <h2 className='centered-content'>{username}</h2>
            {
                profileUser ? (
                    <div className="profile-boxes-container">
                        <div className="main-info-box sticky">
                            {error && (
                            <div className="error">
                                {error}
                            </div>
                            )}
                            {success && (
                            <div className="notice">
                                {success}
                            </div>
                            )}
                            <div className="avatar-section">
                                {
                                    user && user.id !== profileUser.id && (
                                        <button 
                                                className="avatar-button public-corner small-button"
                                                type="button"
                                                onClick={handleFollowToggle}
                                                disabled={isSubmitting}
                                            >
                                            {
                                                isFollowing ? (
                                                    <i className="fa-solid fa-minus"></i>
                                                ):(
                                                    <i className="fa-solid fa-plus"></i>
                                                )
                                            }
                                        </button>
                                    )
                                }
                                <div className="profile-avatar-container">                                    
                                    <img src={avatar} alt="" className="round-image" />
                                    {
                                        user && user.id !== profileUser.id && (
                                            <button 
                                                className="avatar-button public-hover"
                                                type="button"
                                                onClick={handleFollowToggle}
                                                disabled={isSubmitting}
                                            >
                                            {
                                                isFollowing ? (
                                                    <span>unfollow</span>
                                                ):(
                                                    <span>follow</span>
                                                )
                                            }
                                            </button>
                                        )
                                    }
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
                                    value={profileUser.website}
                                    //value="mal;kjsdflkjasdlkfjlskdjfzzzw"
                                    isPublic={true}
                                    isLink={true}
                                />
                                <ProfileItem
                                    name="location"
                                    value={profileUser.location}
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
                                value={profileUser.bio}
                            />           
                        </div>
                    </div>
                ):
                (
                    <p className="centered-content"> loading user...</p>
                )
            }
        </div>
        {<>
            <h2 className='centered-content padded'>{`${username}'s posts`}</h2>
            {
                profileUser?.id && (<>
                    <LimitedTilesContainer
                        screenSize={screenSize}
                        arePrivatePosts={false}
                        fetchMethod={fetchPosts}
                        userId={profileUser?.id}
                        fetchOrder={FetchOrder.Descending}
                        key={profileUser?.id}
                    />            
                    <div className='centered-content'>
                        <Link
                            to={`/${username}/posts`}
                        >
                            view all
                        </Link>
                    </div>    
                </>)
            }
        </>}
    </Layout>);
}

export default UserProfile;