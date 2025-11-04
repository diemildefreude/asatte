    import React, { useCallback, useEffect, useMemo, useState } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { getDateAsYYYYMMDD, getErrorMessage, openPopup } from '../../utils/helpers';
    import { useAuth } from '../../contexts/AuthContext';
    import Layout from '../layout/Layout';
    import './Post.css';
    import '../common/Tile.css';
    import './DashboardProfile.css';
    import UserLink from '../common/UserLink';
    import RichTextEditor from '../common/RichTextEditor';
    import ImageCarousel from '../common/ImageCarousel';
    import TileCarousel from '../common/TileCarousel';
    import CommentSection from '../common/CommentSection';
    import VideoIframe from '../common/VideoIframe';
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    function Post()
    {
        const { username, post_url } = useParams();
        const [post, setPost] = useState(null);
        const [isLiked, setIsLiked] = useState(false);
        const [likeCount, setLikeCount] = useState(0);
        const {fetchSinglePost, toggleLike, recordView, isAuthenticated } = useAuth();
        const navigate = useNavigate();
        
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
        }, [username, post_url, setPost, setIsLiked, setLikeCount]);

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

        return (
        <Layout>
            <div className="post">       
            { 
                post ? (
                <>                    
                    <div className="image-info-statement-container">
                        <div className="image-info-container">
                            <div className="main-image-container">
                                <div className="image-link-subcontainer">
                                    <img className="main-image" src={`${BACKEND_URL}/storage/images/uploaded/${post.user.username}/posts/${post.post_url}/gallery/large/${imageUrls[0]}`} alt="" />
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
                                    <div><h2>{post.title}</h2></div>
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
                                    <div><h2>{post.title}</h2></div>
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
                                <RichTextEditor
                                    readOnly={true}
                                    value={post.statement}  
                                    key={post.id}                              />
                            </div>
                        </div>
                    </div>     
                    {
                        post.main_video && (
                            <div className="page-section video">
                                <VideoIframe url={post.main_video}/>
                            </div>
                        )
                    }       
                    <div className="page-section carousel">
                        <ImageCarousel size="small" post={post} title={"gallery:"}></ImageCarousel>
                    </div>                    
                    <div className="page-section comment-section">
                        <CommentSection post={post} likeCount={likeCount}/>
                    </div>
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