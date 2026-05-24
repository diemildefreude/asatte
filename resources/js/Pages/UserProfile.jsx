import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../Components/layout/Layout';
import {  Link, router, usePage , Head } from '@inertiajs/react';
import { useAuth } from '../contexts/AuthContext';
import ProfileItem from '../Components/common/ProfileItem';
import LimitedTilesContainer from '../Components/common/LimitedTilesContainer';
import './DashboardProfile.css';
import '../Components/common/RichTextEditor.css';
import { FetchOrder, getErrorMessage, getScreenSize, monitorScreenSize, 
    sanitizeRichHtml, hydrateEditorImagePaths } from '../utils/helpers';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UserProfile({ user: profileUserProp })
{
    const { fetchPosts, user, toggleFollow } = useAuth();
    const username = profileUserProp?.username;
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const [profileUser, setProfileUser] = useState(profileUserProp);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(profileUserProp?.is_following || false);
    

    //console.log("profileUser?", profileUser);

    const avatar = profileUser?.avatar ? `${BACKEND_URL}/storage/images/uploaded/users/${username}/avatar/small/${profileUser?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);

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

    const handleCopy = async () => 
    {
        try 
        {
            await navigator.clipboard.writeText(profileUser.email);
            alert('Email copied to clipboard!'); // Replace with a toast notification if preferred
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
    <Layout>
            <Head title="User Profile" />        
        <div className="heading-profile-container public-profile">
            <div className='centered-content vert-1rem'><h1>{username}</h1></div>
            {
                profileUser ? (
                // false ? (
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
                                    name="website"
                                    value={profileUser.website}
                                    isPublic={true}
                                    isLink={true}
                                />
                                <ProfileItem
                                    name="location"
                                    value={profileUser.location}
                                    isPublic={true}
                                />       
                                <div className="flex-row">
                                {
                                    user && (user?.id != profileUser?.id) && (                                        
                                    <div>
                                        <Link href="/dashboard/mail/new" 
                                            state={{addressee: { username: username, ...profileUser}}}
                                            className='link-with-icon'
                                            >
                                            <i className="fa-regular fa-envelope big-icon"/> <span>send DM</span>
                                        </Link>
                                    </div>
                                    )
                                }
                                {
                                    !!profileUser.show_email_in_profile && (
                                    <div>
                                        <a href={`mailto:${profileUser.email}`}
                                            className='link-with-icon'
                                        >
                                            <i className="fa-solid fa-envelopes-bulk big-icon"/> <span>e-mail</span> 
                                        </a> 
                                        {' '}
                                        <button className='button-link' 
                                            aria-label="copy to clipboard" 
                                            title="copy to clipboard"
                                            onClick={handleCopy}
                                        > 
                                            <i className="fa-regular fa-copy big-icon"/>
                                        </button>
                                    </div>
                                    )
                                }
                                </div>
                            </div>        
                        </div>
                        <div className="rte-container">
                            <div className="centered-header-box">       
                                <div className="centered-content">
                                    <h2>bio</h2>                    
                                </div>
                            </div>       
                            <div
                                className="article-text padded"
                                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(hydrateEditorImagePaths(profileUser.bio))}}
                            />                
                        </div>
                    </div>
                ):
                (
                    <p className="centered-content"> loading user...</p>
                )
            }
        </div>
        {
            profileUser ? (<>
            {/* false ? (<> */}
                <h2 className='centered-content padded'>{`${username}'s posts`}</h2>
                <LimitedTilesContainer
                    screenSize={screenSize}
                    arePrivatePosts={false}
                    fetchMethod={fetchPosts}
                    userId={profileUser?.id}
                    fetchOrder={FetchOrder.Descending}
                    key={profileUser?.id}
                />            
                <div className='centered-content'>
                    <Link href={`/${username}/posts`}
                    >
                        view all
                    </Link>
                </div>    
            </>):(null)
        }
    </Layout>);
}

export default UserProfile;