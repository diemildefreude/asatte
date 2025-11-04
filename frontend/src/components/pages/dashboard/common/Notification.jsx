import { getDateAsYYYYMMDD, getTimeAsHHMM, NotificationType } from "../../../../utils/helpers";
import { Link } from "react-router-dom";
import UserLink from "../../../common/UserLink";
import "../../../common/CommentsNotifications.css";

function Notification({notification})
{
    //console.log("notification", notification);
    return (
        <div className="comment">
            <p>
            {
                notification.type == NotificationType.Comment && (<>
                    <UserLink user={notification.comment.user}
                    /> commented on <Link
                        to={`/${notification.comment.post.user.username}/${notification.comment.post.post_url}`}
                    >
                        {notification.comment.post.title}
                    </Link> <em>on {getDateAsYYYYMMDD(notification.created_at)}
                        <span className="notice small"> at {getTimeAsHHMM(notification.created_at)}</span>
                    </em></>)
            }
            {
                notification.type == NotificationType.Reply && (<>
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
                    </em></>)
            }
            </p>
            {
                (notification.type == NotificationType.Comment || NotificationType.Reply) && (<>                    
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
                        dangerouslySetInnerHTML={{ __html: notification.comment.content_html }}
                    >    
                    </p>
                </>)
            }
        </div>
    )
}

export default Notification;