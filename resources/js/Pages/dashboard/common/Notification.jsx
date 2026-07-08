import { getDateAsYYYYMMDD, getTimeAsHHMM, NotificationType, sanitizeRichHtml, getPostUrl } from "../../../utils/helpers";
import { Link, router, usePage } from '@inertiajs/react';
import UserLink from "../../../Components/common/UserLink";
import '../../../Components/common/CommentsNotifications.css';

function Notification({notification})
{

    
    if ((notification?.type == NotificationType.Comment || notification?.type == NotificationType.Reply) && !notification.comment) {
        return null; // Handle orphaned notifications from deleted comments
    }
    
    return (    
    notification ? (
            <div className="comment">
            {
                notification.type == NotificationType.Unhidden && (<>
                <p>
                <span className="bold notice"><em>admin notice</em></span>
                    <em> on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em>
                </p>
                <br/>
                <p>
                    {notification.post ? (
                        <>
                            Your post, <Link href={getPostUrl(notification.post)}>
                                {notification.post.title}
                            </Link>, has been unhidden.
                        </>
                    ) : (
                        "Your post, [post not found], has been unhidden."
                    )}
                </p>
                </>)
            }
            {
                notification.type == NotificationType.Follower && (<>
                <p>
                    <span className="bold notice"><em>new follower</em></span>
                </p>
                <br/>
                <p>
                    <UserLink user={notification.follower}
                    /> started following you <em>on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em>
                </p></>)
            }
            {
                notification.type == NotificationType.Comment && (
                <p>
                    <UserLink user={notification.comment.user}
                    /> commented on <Link href={getPostUrl(notification.comment.post)}
                    >
                        {notification.comment.post?.title}
                    </Link> <em>on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em>
                </p>)
            }
            {
                notification.type == NotificationType.Reply && (<p>
                    <UserLink user={notification.comment.user}
                    /> replied to <Link href={`${getPostUrl(notification.comment.post)}?comment_id=${notification.comment.parent_id}`}
                    >
                        your comment 
                    </Link> in <Link href={getPostUrl(notification.comment.post)}
                    >
                        {notification.comment.post?.title}
                    </Link> <em>on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em></p>)
            }
            {
                (notification.type == NotificationType.Comment || notification.type == NotificationType.Reply) && (<>                    
                    <div className="comment-notice-container">
                        <Link href={`${getPostUrl(notification.comment.post)}?comment_id=${notification.comment.id}`}
                            className="notice small"
                        >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i> go to comment
                        </Link>
                    </div>
                    <p 
                        className="comment-text"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(notification.comment.content_html) }}
                    >    
                    </p>
                </>)
            }
        </div>
    ):(<p>loading...</p>));
}

export default Notification;