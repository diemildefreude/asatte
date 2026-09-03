import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../Components/layout/Layout';
import {  Link, router, usePage } from '@inertiajs/react';
import PageHead from '../Components/layout/PageHead';
import ProfileItem from '../Components/common/ProfileItem';
import AutoloadTilesContainer from '../Components/common/AutoloadTilesContainer';
import CommentSection from '../Components/common/CommentSection';
import '../Components/common/Themes.css';
import './DashboardProfile.css';
import '../Components/common/RichTextEditor.css';
import { FetchOrder, getErrorMessage, getScreenSize, monitorScreenSize, ScreenSize,
    sanitizeRichHtml, hydrateEditorImagePaths, 
    MemberType} from '../utils/helpers';


function UserProfile({ user: profileUserProp })
{
    const { props } = usePage();
    const user = props.auth?.user;
    const appUrl = props.app_url;
    const username = profileUserProp?.username;
    
    const [screenSize, setScreenSize] = useState(getScreenSize());
    const [profileUser, setProfileUser] = useState(profileUserProp);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(profileUserProp?.is_following || false);
    
    const profileComments = props.profileComments || [];
    const canDeleteAnyComment = !!user && user.id === profileUser?.id;

    const avatar = profileUser?.avatar ? `${appUrl}/storage/images/uploaded/users/${username}/avatar/small/${profileUser?.avatar}` 
        : `${appUrl}/images/defaults/avatar.webp?v=1`;

    useEffect(() => //check screen size at regular intervals.
    {   
        const cleanup = monitorScreenSize(setScreenSize);
        return cleanup;
    }, []);

    const handleFollowToggle = useCallback(() =>
    {
        setIsSubmitting(true);
        router.post(`/${profileUserProp.id}/follow`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmitting(false);
                if (page.props.flash?.success) {
                    setSuccess(page.props.flash.success);
                    setError('');
                }
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setError(errors.error || 'Failed to toggle follow.');
                setSuccess('');
            }
        });
    }, [profileUserProp, setIsSubmitting, setError, setSuccess]);

    useEffect(() => {
        setIsFollowing(profileUserProp?.is_following || false);
    }, [profileUserProp]);

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
    <>
        <PageHead title={`${username}'s profile`}
        />        
        <div className={`heading-profile-container public-profile ${profileUser?.theme && profileUser.theme !== 'default' ? profileUser.theme : ''}`}>
            <div className='centered-content vert-1rem'><h1>{username}</h1></div>
            {
                profileUser ? (
                    <div className="profile-boxes-container">
                        <div className="main-info-box yellow-gradient-background sticky">
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
                                    <img src={avatar} alt={`${user?.username}'s avatar`} className="round-image" />
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
                                {
                                    (profileUser.member_type == MemberType.Webmaster) && (
                                    <div className='member-type centered-content no-margin'>
                                        <span>webmaster</span>
                                    </div>)
                                }
                                {
                                    (profileUser.member_type == MemberType.Admin) && (
                                    <div className='member-type admin centered-content no-margin'>
                                        <span>admin</span>
                                    </div>)
                                }
                                <ProfileItem
                                    name="websites"
                                    value={profileUser.websites || (profileUser.website ? [profileUser.website] : [])}
                                    isPublic={true}
                                    isLink={true}
                                    isArray={true}
                                />
                                <ProfileItem
                                    name="location"
                                    value={profileUser.location}
                                    isPublic={true}
                                />       
                                <div className="flex-row">                                   
                                    <span>
                                        <Link href="/dashboard/mail/new" 
                                            data={{addressee: username}}
                                            className='link-with-icon'
                                            >
                                            <i className="fa-regular fa-envelope medium-icon"/> <span>send DM</span>
                                        </Link>
                                    </span>
                                    {
                                    !!profileUser.show_email_in_profile && (
                                    <span>
                                        <a href={`mailto:${profileUser.email}`}
                                            className='link-with-icon'
                                        >
                                            <i className="fa-solid fa-envelopes-bulk medium-icon"/> <span>e-mail</span> 
                                        </a> 
                                        {' '}
                                        <button className='button-link' 
                                            aria-label="copy to clipboard" 
                                            title="copy to clipboard"
                                            onClick={handleCopy}
                                        > 
                                            <i className="fa-regular fa-copy medium-icon"/>
                                        </button>
                                    </span>
                                    )}
                                </div>
                            </div>        
                        </div>
                        <div className="rte-container black-gradient-background">
                            <div className="centered-header-box">       
                                <div className="centered-content top-2rem">
                                    <h2>bio</h2>                    
                                </div>
                            </div>       
                            <article
                                className="article-text padded"
                                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(hydrateEditorImagePaths(profileUser.bio, appUrl))}}
                            />                
                        </div>
                    </div>
                ):
                (
                    <p className="centered-content"> loading user...</p>
                )
            }
            {
            profileUser ? (<>
                <h2 className='centered-content top-1rem'>{`${username}'s posts`}</h2>
                <AutoloadTilesContainer
                    screenSize={screenSize}
                    initialPosts={props.initialPosts || []}
                    loadOnScroll={false}
                    maxItems={{
                        [ScreenSize.Nothing]: 0,
                        [ScreenSize.Narrow]: 3, 
                        [ScreenSize.Small]: 6,
                        [ScreenSize.Mid]: 8,
                        [ScreenSize.Wide]: 12
                    }}
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
                
                <div className="page-section comment-section" style={{marginTop: "2rem"}}>
                    <CommentSection 
                        comments={profileComments}
                        apiRoutePrefix={`/users/${profileUser.id}`}
                        canDeleteAnyComment={canDeleteAnyComment}
                        isUserProfile={true}
                    />
                </div>
            </>):(null)
        }
        </div>        
    </>);
}


UserProfile.layout = page => <Layout>{page}</Layout>;
export default UserProfile;