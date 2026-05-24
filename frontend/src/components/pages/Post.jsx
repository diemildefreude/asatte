    import React, { useCallback, useEffect, useMemo, useState } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getDateAsYYYYMMDD, getErrorMessage, hydrateEditorImagePaths, MemberType, openPopup, processEditorImages, sanitizeRichHtml } from '../../utils/helpers';
    import { useAuth } from '../../contexts/AuthContext';
    import Layout from '../layout/Layout';
    import './Post.css';
    import '../common/Tile.css';
    import './DashboardProfile.css';
    import UserLink from '../common/UserLink';
    import ImageCarousel from '../common/ImageCarousel';
    import TileCarousel from '../common/TileCarousel';
    import CommentSection from '../common/CommentSection';
    import VideoIframe from '../common/VideoIframe';
    import HiddenPostNotice from '../common/HiddenPostNotice';
    import RichTextEditor from '../common/RichTextEditor';
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    function Post()
    {
        const { username, post_url } = useParams();
        const [post, setPost] = useState(null);
        const [isLiked, setIsLiked] = useState(false);
        const [likeCount, setLikeCount] = useState(0);
        
        const [adminMessageIsVisible, setAdminMessageIsVisible] = useState(false);
        const [adminMessage, setAdminMessage] = useState("");
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [success, setSuccess] = useState("");
        const [error, setError] = useState("");

        const {fetchSinglePost, toggleLike, toggleAdminPostHide,
            recordView, isAuthenticated, user } = useAuth();
        const navigate = useNavigate();

        const isAdmin = (user?.member_type == MemberType.Webmaster 
                            || user?.member_type == MemberType.Admin);
        
        useEffect(() =>
        {
            if(!post)
            {
                return;
            }
            recordView(post.id).then((response) =>
            {
                console.log("view?", response.status);
            }).catch((err) => 
            {
                const msg = getErrorMessage(err);
                console.log(msg);
            })            
        },[post]);
        
        const imageUrls = useMemo(() =>
        {
            try
            {
                return post?.gallery_image_urls ?? [];
            }
            catch(err)
            {
                const msg = getErrorMessage(err);
                console.log(msg);
                return [];                
            }
        }, [post]);

        const videoUrl = useMemo(() =>
        {
            try 
            {
                return post?.main_video ?? null;
            }
            catch(err)
            {
                const msg = getErrorMessage(err);
                console.log(msg);
                return [];                
            }
        }, [post]);

        useEffect(() =>
        {
            fetchSinglePost(username, post_url).then((data) =>
            {
                setPost(data); 
                setIsLiked(!!data.have_liked);
                setLikeCount(data.users_who_liked_count);
                //window.scrollTo(0,0);
            })
            .catch((err) =>
            {
                const status = err.response?.status || err.status;
                console.log("err", err);
                if(status === 404)
                {
                    console.log("navigating away...");
                    navigate('/not-found', {replace:true});
                }
            });  
        }, [username, post_url]);

        const handleLikeToggle = useCallback(() =>
        {
            if(!post)
            {
                return;
            }
            const prevIsLiked = isLiked;
            const prevLikeCount = likeCount;
            const countChange = isLiked ? -1 : 1;
            setIsLiked(prev => !prev);
            setLikeCount(prev => prev + countChange);

            toggleLike(post.id).then((data) =>
            {
                setIsLiked(!!data.liked);
                setLikeCount(data.like_count);
            })
            .catch((err) =>
            {
                setIsLiked(!!prevIsLiked);
                setLikeCount(prevLikeCount);
                console.log(err);
            });
        },[post, isLiked, setIsLiked, likeCount, setLikeCount]);

        const handleHideSubmit = useCallback(async (e, hide) =>
        {
            e.preventDefault();
            setSuccess("");
            setError("");
            if(!hide)
            {
                const isConfirmed = window.confirm("Make post visible?");
                if(!isConfirmed)
                {
                    return;
                }
            }
            try
            {
                setIsSubmitting(true);
                const messageWithProcessedPhotos = await processEditorImages(adminMessage);
                const data = await toggleAdminPostHide(hide, post.id, messageWithProcessedPhotos);
                setAdminMessage("");
                setSuccess(data.message);
                setAdminMessageIsVisible(false);
                setPost(data.post);
            }
            catch(err)
            {
                const msg = getErrorMessage(err);
                setError(msg);
            }
            finally
            {
                setIsSubmitting(false);
            }
        },[adminMessage, post]);

        const handleHideClick = useCallback(() =>
        {
            const adminStarterText = `<p>Your post, <a href="/${post.user.username}/${post.post_url}"><em>${post.title}</em></a> has been hidden.</p>
            <p> reason: </p>    
            <p> If you wish to dispute this decision, please reply to this message.</p>
            `;
            setAdminMessage(adminStarterText);
            setAdminMessageIsVisible(true); 
            setSuccess(""); 
            setError("");
        },[post]);

        return (
        <Layout>
            <div className="post">       
            { 
                post ? (
                <>    
                    <article>
                    <div className="image-info-statement-container">
                        {
                            post.is_hidden_by_admin && (                
                            <HiddenPostNotice 
                                classes="top-3rem"
                                isAdmin={true}
                            />
                            )
                        }
                        <div className="image-info-container">
                            <div className="main-image-container">
                                <div className="image-link-subcontainer">
                                    <img className="main-image" src={`${BACKEND_URL}/storage/images/uploaded/users/${post.user.username}/posts/${post.post_url}/gallery/large/${imageUrls[0]}`} alt="" />
                                    <div className="main-image-link-container">
                                        <div className="info-panel">                        
                                        { 
                                            post.website ?
                                            (
                                                <div className="info-item action-links link-container">
                                                    <a className="post-link" 
                                                        href={post.website}
                                                        onClick={(e) =>
                                                        {
                                                            e.preventDefault();
                                                            openPopup(post.website,`${post.id} : ${post.title}`, 
                                                                window.screen.width * 0.2, window.screen.height * 0.2,
                                                                window.screen.width * 0.8, window.screen.height * 0.8);
                                                        }}  
                                                    >
                                                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                                        <span>visit site</span>
                                                    </a>
                                                </div>
                                            ) : ( <></>)
                                        }
                                        {
                                            isAuthenticated && (
                                            <div>
                                                <button 
                                                    type="button" 
                                                    className={isLiked ? "like-button liked" : "like-button"}
                                                    onClick={handleLikeToggle}                                                    
                                                    aria-label="Toggle Like"
                                                    aria-pressed={isLiked}
                                                >
                                                    <i className={isLiked ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                                </button>
                                            </div>)
                                        }
                                        </div>
                                    </div>
                                </div>                                
                            </div>
                            <div className="page-section main-info-container top-version">
                                <div className="main-info-box">
                                    <div className='centered-content'><h1>{post.title}</h1></div>
                                        <div><p><em>{post.subtitle}</em></p></div>   
                                        <div><p className="post-date"> posted by <UserLink user={post.user}/> <em>on {getDateAsYYYYMMDD(post.created_at)}</em></p></div> 
                                        {
                                            post.source_code &&
                                            (
                                                <div className="source-link"><a href={post.source_code} target="_blank"><i className="fa-solid fa-code"></i><span>source</span></a></div>   
                                            )
                                        }
                                </div>
                            </div>
                        </div>
                        <div className="main-info-statement-container">
                            <div className="page-section main-info-container sticky-version">
                                <div className="main-info-box">
                                    <div className='centered-content no-margin'><h1>{post.title}</h1></div>
                                    <div><p><em>{post.subtitle}</em></p></div>   
                                    <div><p className="post-date"> posted by <UserLink user={post.user}/> on 2025.5.12</p></div>    
                                    {
                                        post.source_code &&
                                        (
                                            <div className="source-link"><a href={post.source_code} target="_blank"><i className="fa-solid fa-code"></i><span>source</span></a></div>   
                                        )
                                    }
                                </div>
                            </div>
                            <div className="page-section statement rte-container">
                                <div
                                    dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(hydrateEditorImagePaths(post.statement))}}
                                />
                            </div>
                        </div>
                    </div>     
                    {
                        videoUrl && (
                            <div className="page-section video">
                                <VideoIframe url={videoUrl}/>
                            </div>
                        )
                    }    
                    <div className="page-section carousel">
                        <ImageCarousel size="small" post={post} title={"gallery:"}></ImageCarousel>
                    </div>       
                    </article>                
                    <div className="page-section comment-section">
                        <CommentSection post={post} likeCount={likeCount}/>
                    </div>
                    {
                        isAdmin &&
                        (<>
                            <h3 className='centered-content'>admin:</h3>
                            {<>
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
                                {post.is_hidden_by_admin ? (
                                    <div className="centered-content">
                                        <button 
                                            onClick={(e) => handleHideSubmit(e, false)}
                                            className='red-button'
                                        >
                                            show post
                                        </button>                                        
                                    </div> 
                                ):(
                                    <div className="centered-content">
                                        {          
                                            !adminMessageIsVisible ? (                                  
                                            <button className='red-button'
                                                onClick={handleHideClick}
                                            >
                                                hide post
                                            </button>):(<form onSubmit={(e) => handleHideSubmit(e, true)}>
                                                <div className='notice'>
                                                    <em>Let the user know why you're hiding their post.</em>
                                                </div>
                                                <RichTextEditor
                                                    placeholder="Let the user know why you're hiding their post."
                                                    readOnly={isSubmitting}
                                                    onChange={(m) => setAdminMessage(m)}
                                                    value={adminMessage}
                                                />
                                                <div className="horizontal-buttons-container">
                                                    <button 
                                                        className='red-button'
                                                        type='submit'
                                                    >
                                                        confirm
                                                    </button>
                                                    <button onClick={() => setAdminMessageIsVisible(false)}>
                                                        cancel
                                                    </button>
                                                </div>
                                            </form>)
                                        }
                                    </div> 
                                )}
                            </>}
                        </>)
                    }
                    <div className="page-section carousel">                        
                        <TileCarousel 
                            size="small" 
                            userId={post.user.id}
                            title="more from this user:"
                            excludePostId={post.id}
                            key={post.user.id}
                        />
                    </div>                    
                </>
            ) :
            (
                <p className='loading'>loading post...</p>
            )
            }
            </div>
        </Layout>
        )
    }

    export default Post;