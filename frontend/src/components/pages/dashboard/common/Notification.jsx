import { getDateAsYYYYMMDD, getTimeAsHHMM, NotificationType, sanitizeRichHtml } from "../../../../utils/helpers";
import { Link } from "react-router-dom";
import UserLink from "../../../common/UserLink";
import "../../../common/CommentsNotifications.css";

function Notification({notification})
{
    //console.log("notification", notification);
    
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
                    Your post, <Link to={`/${notification.post.user.username}/${notification.post.post_url}`}>
                        {notification.post.title}
                    </Link>, has been unhidden.
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
                    /> commented on <Link
                        to={`/${notification.comment.post.user.username}/${notification.comment.post.post_url}`}
                    >
                        {notification.comment.post.title}
                    </Link> <em>on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em>
                </p>)
            }
            {
                notification.type == NotificationType.Reply && (<p>
                    <UserLink user={notification.comment.user}
                    /> replied to <Link
                        to={`/${notification.comment.post.user.username}/${notification.comment.post.post_url}?comment_id=${notification.comment.parent_id}`}
                    >
                        your comment 
                    </Link> in <Link
                        to={`/${notification.comment.user.username}/${notification.comment.post.post_url}`}
                    >
                        {notification.comment.post.title}
                    </Link> <em>on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em></p>)
            }
            {
                (notification.type == NotificationType.Comment || notification.type == NotificationType.Reply) && (<>                    
                    <div className="comment-notice-container">
                        <Link
                            to={`/${notification.comment.post.user.username}/${notification.comment.post.post_url}?comment_id=${notification.comment.id}`}
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