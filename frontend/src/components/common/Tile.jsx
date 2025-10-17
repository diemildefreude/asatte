import React from 'react';
import './Tile.css';
import UserLink from './UserLink';
import './UserLink.css';
import { openPopup } from '../../utils/helpers';
import { Link } from 'react-router-dom';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

function Tile({post, isSliderDraggedPointerUp, user=null, isDashboard=false}) 
{
    if (!post || (!user && !post.user)) return null;

    const author = user ?? post.user;
    const viewText = isDashboard ? "preview" : "info";

    const directory = `${BACKEND_URL}/storage/images/uploaded/${author.username}/posts/${post.post_url}/gallery/small`;

    let imageUrls = [];
    try 
    {
        imageUrls = post?.gallery_image_urls ?? [];// ? JSON.parse(post.gallery_image_urls) : [];
    } 
    catch (err) 
    {
        console.error("Invalid gallery_image_urls JSON", err);
        imageUrls = [];
    }
    function handleLinkClick(e)
    {
        console.log("Clicking link to post", post?.id);

        if(isSliderDraggedPointerUp?.current)
        {
            e.preventDefault(); // Stop the link from navigating if it was a drag
            e.stopPropagation(); // Stop event from bubbling up further
            return;
        }
    }
    return (
        <div className="work-tile">                                    
        { 
            imageUrls && imageUrls.length > 0 && 
            (
                <img src={`${directory}/${imageUrls[0]}`} 
                    alt={post.title} 
                    draggable="false"
                />
            )                            
        }
            <div className="info-panel">
                <div className="panel-top">
                    <div className="info-item title">{post.title}</div>
                    <div className="info-item subtitle">{post.subtitle}</div>
                    {
                        !isDashboard && (
                            <div className="info-item link-container">
                                <UserLink user={author}
                                    onClick={handleLinkClick}
                                    />
                            </div>
                        )
                    }
                </div>
                <div className="panel-bottom">
                    {
                        isDashboard &&
                        (
                            <div className="info-item action-links link-container">
                                <Link 
                                    to={`/dashboard/edit-post/${post.post_url}`}
                                    className="post-link"
                                    onClick={handleLinkClick} 
                                    draggable="false"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                    <span>edit</span>  
                                </Link>
                            </div>
                        )
                    }
                    <div className="info-item action-links link-container">
                        { !post && <p>Post not loaded yet</p> }

                        <Link 
                            to={`/${post.user.username}/${post.post_url}`} 
                            className="post-link"
                            onClick={handleLinkClick} 
                            draggable="false"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span>{viewText}</span>                                            
                        </Link>
                    </div>
                    {
                        (isDashboard && post.is_private) ?
                        (
                            <div className="info-item">
                                <i className="fa-solid fa-eye-slash"></i>
                            </div>
                        ):
                        (null)
                    }                    
                    {
                        post.website && !isDashboard && 
                        (
                            <div className="info-item action-links link-container">
                                <a href={post.web_page_url} 
                                    className="post-link"
                                    draggable="false"
                                    onClick={(e) => 
                                    {
                                        if(isSliderDraggedPointerUp?.current)
                                        {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            return;
                                        }
                                        e.preventDefault();
                                        openPopup(post.web_page_url,`${post.id} : ${post.title}`, 
                                            window.screen.width * 0.2, window.screen.height * 0.2,
                                            window.screen.width * 0.8, window.screen.height * 0.8);
                                    }
                                }>
                                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                    <span>visit</span>                                            
                                </a>
                                </div>
                        )
                    }                                    
                </div>
            </div>
            
        </div>
    )
}

export default Tile;