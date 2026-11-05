    import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
    import {  Link, router, usePage } from '@inertiajs/react';
    import PageHead from '../Components/layout/PageHead';
    import { getDateAsYYYYMMDD, getErrorMessage, hydrateEditorImagePaths, MemberType, openPopup, processEditorImages, sanitizeRichHtml, getPostUrl, copyToClipboard } from '../utils/helpers';

    import Layout from '../Components/layout/Layout';
    import './Post.css';
    import '../Components/common/Tile.css';
    import './DashboardProfile.css';
    import '../Components/common/Themes.css';
    import '../Components/common/UserLink.css';
    import './dashboard/TagsMail.css';
    import UserLink from '../Components/common/UserLink';
    import ImageCarousel from '../Components/common/ImageCarousel';
    import TileCarousel from '../Components/common/TileCarousel';
    import CommentSection from '../Components/common/CommentSection';
    import VideoIframe from '../Components/common/VideoIframe';
    import HiddenPostNotice from '../Components/common/HiddenPostNotice';
    import RichTextEditor from '../Components/common/RichTextEditor';

    function Post({ post, carouselPosts: userPosts = [], allLikers = null })
    {
        const { props } = usePage();
        const appUrl = props.app_url;
        const isLiked = !!post?.have_liked;
        const likeCount = post?.users_who_liked_count || 0;
        
        const [adminMessageIsVisible, setAdminMessageIsVisible] = useState(false);
        const [adminMessage, setAdminMessage] = useState("");
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [adminSuccess, setAdminSuccess] = useState("");
        const [adminError, setAdminError] = useState("");
        const [isLikersShortlistOpen, setIsLikersShortlistOpen] = useState(false);
        const [isAllLikersModalOpen, setIsAllLikersModalOpen] = useState(false);
        const [isLoadingAllLikers, setIsLoadingAllLikers] = useState(false);
        const likeCountRef = useRef(null);
        
        const user = props.auth?.user;
        const isAuthenticated = !!user;
        const isPostCreator = isAuthenticated && user?.id === post?.user_id;
        const initialLikers = useMemo(() => (post?.users_who_liked || []).slice(0, 5), [post?.users_who_liked]);

        const isWebmaster = user?.member_type === MemberType.Webmaster;
        const isAdmin = user?.member_type === MemberType.Admin;
        
        let canHidePost = false;
        const authorMemberType = post?.user?.member_type;

        console.log("carouselPosts", userPosts ?? null);
        if (isWebmaster) 
        {
            canHidePost = true;
        } 
        else if (isAdmin) 
        {            
            if (authorMemberType !== MemberType.Webmaster && authorMemberType !== MemberType.Admin) {
                canHidePost = true;
            }
        }
        useEffect(() =>
        {
            if(!post) return;
            router.post(`/posts/${post.id}/record-view`, {}, {
                preserveScroll: true,
                preserveState: true,
                replace: true
            });
        },[post.id]);
        
        const imageUrls = useMemo(() =>
        {
            try
            {
                return post?.gallery_image_urls ?? [];
            }
            catch(err)
            {
                const msg = getErrorMessage(err);

                return [];                
            }
        }, [post]);

        const mainImg = `${appUrl}/storage/images/uploaded/users/${post.user.username}/posts/${post.slug}/gallery/large/${imageUrls[0]}`;
        const mainAlt = post?.gallery_alts[0] ?? "";


        const videoUrl = useMemo(() =>
        {
            try 
            {
                return post?.main_video ?? null;
            }
            catch(err)
            {
                const msg = getErrorMessage(err);

                return [];                
            }
        }, [post]);

        const handleLikeToggle = useCallback(() =>
        {
            if(!post) return;
            router.post(`/posts/${post.id}/like`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        },[post.id]);

        const handleHideSubmit = useCallback(async (e, hide) =>
        {
            e.preventDefault();
            setAdminSuccess("");
            setAdminError("");
            if(!hide)
            {
                const isConfirmed = window.confirm("Make post visible?");
                if(!isConfirmed) return;
            }
            setIsSubmitting(true);
            try
            {
                router.post(`/set-admin-hide/${post.id}`, 
                {
                    _method: 'PUT',
                    is_hidden_by_admin: hide,
                    reason: adminMessage
                }, 
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setAdminMessage("");
                        setAdminMessageIsVisible(false);
                        setIsSubmitting(false);
                        setAdminSuccess(hide ? "Post successfully hidden." : "Post successfully unhidden.");
                    },
                    onError: (errs) => {
                        setIsSubmitting(false);
                        if(errs && errs.error) setAdminError(errs.error);
                        else setAdminError("An error occurred.");
                    }
                });
            }
            catch(err)
            {
                setIsSubmitting(false);
            }
        },[adminMessage, post.id]);

        const handleHideClick = useCallback(() =>
        {
            setAdminMessage("Not Internet-related.");
            setAdminMessageIsVisible(true); 
        },[]);

        useEffect(() => {
            if (!isLikersShortlistOpen) return;
            const handleOutsideClick = (e) => {
                if (likeCountRef.current && !likeCountRef.current.contains(e.target)) {
                    setIsLikersShortlistOpen(false);
                }
            };
            document.addEventListener('pointerdown', handleOutsideClick);
            return () => document.removeEventListener('pointerdown', handleOutsideClick);
        }, [isLikersShortlistOpen]);

        useEffect(() => {
            if (!isAllLikersModalOpen) {
                document.body.classList.remove('modal-open');
                return;
            }
            document.body.classList.add('modal-open');
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    setIsAllLikersModalOpen(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.classList.remove('modal-open');
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [isAllLikersModalOpen]);

        const handleLikeCountClick = useCallback((e) => {
            if (!isPostCreator || likeCount <= 0) return;
            if (e.target.closest('.likers-shortlist-popup')) return;
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || document.querySelector('.content.touch-device');
            if (isTouch) {
                e.preventDefault();
                e.stopPropagation();
                setIsLikersShortlistOpen(prev => !prev);
            }
        }, [isPostCreator, likeCount]);

        const handleShowAllLikers = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLikersShortlistOpen(false);
            setIsAllLikersModalOpen(true);
            setIsLoadingAllLikers(true);
            router.reload({
                only: ['allLikers'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => {
                    setIsLoadingAllLikers(false);
                },
            });
        }, []);

        const likeCountPopup = (isPostCreator && likeCount > 0 && initialLikers.length > 0) ? (
            <div className="results-container likers-shortlist-popup">
                {initialLikers.map((liker) => (
                    <div className="tag" key={liker.id}>
                        <UserLink user={liker} />
                    </div>
                ))}
                {likeCount > 5 && (
                    <div className="show-all-likers-wrapper">
                        <button
                            type="button"
                            className="button-link show-all-likers-btn"
                            onClick={handleShowAllLikers}
                        >
                            <span>show all</span>
                        </button>
                    </div>
                )}
            </div>
        ) : null;

        return (
        <>
            <PageHead title={post.is_news ? `News: "${post.title}"` :
            `'${post.title}' by ${post.user.username}`}
                description={post.subtitle}
                ogType="article"
                ogImg={mainImg}
            />
            <div className={`post ${post?.theme && post.theme !== 'default' ? post.theme : ''}`}>       
            { 
                post ? (
                <>    
                    <article>
                    <div className="image-info-statement-container">
                        {
                            post.is_hidden_by_admin && (                
                            <HiddenPostNotice 
                                classes="top-3rem"
                                isAdmin={authorMemberType === MemberType.Admin}
                            />
                            )
                        }
                        <div className="image-info-container">
                            <div className="main-image-container">
                                <div className="image-link-subcontainer">
                                    <img className="main-image" src={mainImg} alt={mainAlt} />
                                    <div className="main-image-link-container">
                                        <div className="info-panel">
                                        {
                                            (post?.is_private || post?.is_draft)? (
                                            <div
                                                className={"big-icon blue"}
                                                title={post?.is_private ? "private" : "draft"}                                                   
                                            >
                                                <i className={post?.is_private ? "fa-regular fa-eye-slash" : "fa-solid fa-file-pen"}></i>
                                            </div>
                                            ):(
                                            isAuthenticated && (
                                                <button 
                                                    type="button" 
                                                    className={isLiked ? "like-button liked" : "like-button"}
                                                    onClick={handleLikeToggle}                                                    
                                                    aria-label="Toggle Like"
                                                    aria-pressed={isLiked}
                                                >
                                                    <i className={isLiked ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                                </button>))
                                        }
                                        { 
                                            post.website ?
                                            (
                                                <div className="info-item action-links link-container group">
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
                                                    {' '}
                                                    <button className='button-link' 
                                                        aria-label="copy URL to clipboard" 
                                                        title={`copy ${post.website} to clipboard`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            copyToClipboard(post.website, 'Website URL copied to clipboard!');
                                                        }}
                                                    > 
                                                        <i className="fa-regular fa-copy medium-icon"/>
                                                    </button>
                                                </div>
                                            ) : ( <></>)
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
                                            post.premiere_date && (
                                                <div><p className="post-date"><em>premiered on {getDateAsYYYYMMDD(post.premiere_date)}</em></p></div> 
                                            )
                                        }
                                        {
                                            post.source_code && (
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
                                    <div><p className="post-date"> posted by <UserLink user={post.user}/> on {getDateAsYYYYMMDD(post.created_at)}</p></div>    
                                    {
                                        post.premiere_date && (
                                            <div><p className="post-date"><em>premiered on {getDateAsYYYYMMDD(post.premiere_date)}</em></p></div> 
                                        )
                                    }
                                    {
                                        post.source_code && (
                                            <div className="source-link"><a href={post.source_code} target="_blank"><i className="fa-solid fa-code"></i><span>source</span></a></div>   
                                        )
                                    }
                                </div>
                            </div>
                            <div className="page-section statement rte-container article-text"
                                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(hydrateEditorImagePaths(post.statement, appUrl))}}
                            >
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
                        <CommentSection 
                            comments={post.comments} 
                            likeCount={likeCount}
                            viewCount={post.view_count}
                            apiRoutePrefix={`/posts/${post.id}`}
                            likeCountPopup={likeCountPopup}
                            onLikeCountClick={handleLikeCountClick}
                            likeCountRef={likeCountRef}
                            isLikePopupOpen={isLikersShortlistOpen}
                        />
                    </div>
                    {isAllLikersModalOpen && (
                        <div
                            className="likers-modal-backdrop"
                            onClick={() => setIsAllLikersModalOpen(false)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="likers-dialog-title"
                        >
                            <div
                                className="likers-dialog"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="likers-dialog-header">
                                    <h2 id="likers-dialog-title" className="likers-dialog-title">liked by</h2>
                                    <button
                                        type="button"
                                        className="likers-dialog-close"
                                        onClick={() => setIsAllLikersModalOpen(false)}
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="results-container likers-dialog-list">
                                    {isLoadingAllLikers && !allLikers ? (
                                        <div className="tag likers-loading">loading...</div>
                                    ) : (
                                        (allLikers || initialLikers).map((liker) => (
                                            <div className="tag" key={liker.id}>
                                                <UserLink user={liker} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {
                        canHidePost &&
                        (<>
                            <h3 className='centered-content'>admin:</h3>
                            {<>
                                {adminError && (
                                <div className="error">
                                    {adminError}
                                </div>
                                )}
                                {adminSuccess && (
                                <div className="notice">
                                    {adminSuccess}
                                </div>
                                )}
                                {post.is_hidden_by_admin ? (
                                    <div className="centered-content">
                                        <button 
                                            onClick={(e) => handleHideSubmit(e, false)}
                                            className='red-button'
                                        >
                                            unhide post
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
                                                <textarea
                                                    required
                                                    className="w-100"
                                                    style={{minHeight: "100px", padding: "10px"}}
                                                    disabled={isSubmitting}
                                                    onChange={(e) => setAdminMessage(e.target.value)}
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
                    <div className={post.is_news ? "page-section carousel" : "page-section carousel small-heading"}>                        
                        <TileCarousel 
                            size="small" 
                            title={post.is_news ? "more news:" : `more from ${post.user.username}:`}
                            posts={userPosts}
                        />
                    </div>                    
                </>
            ) :
            (
                <p className='loading'>loading post...</p>
            )
            }
            </div>
        </>
        )
    }

    
Post.layout = page => <Layout>{page}</Layout>;
export default Post;