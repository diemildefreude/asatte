
import UserLink from './UserLink';
import { getDateAsYYYYMMDD, copyToClipboard } from '../../utils/helpers';

function PostInfoBox({post, isAuthenticated, isLiked, likeHandler})
{
    return(
    <div className="main-info-box">
        <div className='centered-content'><h1>{post.title}</h1></div>
        <div><p><em>{post.subtitle}</em></p></div>   
        <div><p className="post-date"> posted by <UserLink user={post.user}/> <em>on {getDateAsYYYYMMDD(post.created_at)}</em></p></div> 
        {
            post.premiere_date && (
                <div><p className="post-date"><em>premiered on {getDateAsYYYYMMDD(post.premiere_date)}</em></p></div> 
            )
        }
        <div className="info-box-links">
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
                        onClick={likeHandler}                                                    
                        aria-label="Toggle Like"
                        aria-pressed={isLiked}
                    >
                        <i className={isLiked ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                    </button>))
            }
            {
                post.source_code && (
                    <div className="post-info-link">
                        <a href={post.source_code} target="_blank">
                            <i className="fa-solid fa-code"></i><span>code</span></a>
                    </div>   
                )
            }    
            {
                post.website && (
                    <div className="post-info-link"
                        target="_blank"    
                    >
                        <a href={post.website}  
                        >
                            <i className="fa-solid fa-globe"></i><span>link</span>
                        </a>
                    </div>
                )
            }
        </div>
    </div>
    )
}

export default PostInfoBox;