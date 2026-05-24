import { getDateAsYYYYMMDD, getErrorMessage, getTimeAsHHMM, sanitizeRichHtml, scrollToElement } from "../../utils/helpers";
import UserLink from "./UserLink";
import { useAuth } from "../../contexts/AuthContext";
import EditButton from "./EditButton";
import { useCallback, useState } from "react";
import { Link, router, usePage } from '@inertiajs/react';
import "./CommentsNotifications.css";

function Comment({comment, isDashboard=false, onReply=null, id, parentLocalId=null, currentUrl=null, setComments=null})
{
    const {user, isAuthenticated, updateComment, deleteComment} = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const elementId = `comment-${id}`;
    const parentElementId = parentLocalId ? `comment-${parentLocalId}` : null;
    
    const handleCommentEdit = useCallback(() =>
    {
        setIsEditing(true);
        setContent(comment.content);
    },[setIsEditing, setContent, comment]);

    const handleEditCancel = useCallback(() =>
    {
        const isConfirmed = window.confirm("Revert changes?");
        if(!isConfirmed)
        {
            return;
        }
        setIsEditing(false);
        setContent(comment.content);　//reset 
    },[setIsEditing, setContent, comment]);

    const handleCommentUpdate = useCallback(() =>
    {
        setIsSubmitting(true);
        updateComment(comment.id, comment.post_id, content)
        .then((data) =>
        {
            console.log(data.message);
            setIsSubmitting(false);
            setIsEditing(false);
            setComments(data.comments);
        })
        .catch((err) =>
        {
            const msg = getErrorMessage(err);
            console.error(msg);            
            setIsSubmitting(false);
        });
    },[content, setIsSubmitting, updateComment, comment, setIsEditing, setComments]);

    const handleCommentDelete = useCallback(() =>
    {
        const isConfirmed = window.confirm("Delete comment?");
        if(!isConfirmed)
        {
            return;
        }
        setIsSubmitting(true);
        deleteComment(comment.id, comment.post_id)
        .then((data) =>
        {
            console.log(data.message);
            setIsSubmitting(false);
            setIsEditing(false);
            setComments(data.comments);
        })
        .catch((err) =>
        {
            const msg = getErrorMessage(err);
            console.error(msg);            
            setIsSubmitting(false);
        });
    },[comment, setIsSubmitting, setIsEditing, setComments, deleteComment])

    return (
    <div className="comment" id={elementId}>
        <p>
        {
            isDashboard && comment.post ? (<>
                in <Link href={`/${comment.post.user.username}/${comment.post.post_url}`} //+#comment-0
                    className="bold"
                >
                    {comment.post.title}
                </Link> <em>on {getDateAsYYYYMMDD(comment.created_at)}
                <span className="notice small"> at {getTimeAsHHMM(comment.created_at)}</span></em> 
            </>):(<>
                <UserLink user={comment.user}/> <em>on {getDateAsYYYYMMDD(comment.created_at)}
                <span className="notice small"> at {getTimeAsHHMM(comment.created_at)}</span></em>
            </>)
        }                      
        </p>
        <div className="comment-notice-container">
        {            
            !isDashboard && (comment.created_at !== comment.updated_at) && (
                <span className="notice small greyed-out">
                    (edited)
                </span>
            )
        }
        {
            comment.parent_id && (parentLocalId != null) && currentUrl ? (
                <span className="notice small"> replied to <a 
                    href={`${currentUrl}/comment-${parentLocalId}`}
                    onClick={(e) => {e.preventDefault(); scrollToElement(currentUrl, parentElementId)}}
                >
                    this</a> comment
                </span>
            ) : null
        }
        {
            isDashboard && comment.post && ( //post is only included when using fetchUserComments
                <Link href={`/${comment.post.user.username}/${comment.post.post_url}?comment_id=${comment.id}`}
                    className="notice small"
                >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> go to comment
                </Link>
            )
        }
        </div>
        {
            isEditing ? (
                <textarea
                    name={`comment-edit-${id}`}
                    id={`comment-edit-${id}`}
                    className="comment-edit-area"
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                    disabled={isSubmitting}
                />
            ):(<p 
                className="comment-text"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(comment.content_html) }}
            >    
            </p>)
        }
        {
            isAuthenticated && (
            <div className="comment-buttons-container">
                {
                    !isEditing && onReply && (<>                        
                        <button 
                            onClick={() => onReply(comment, elementId, true)}
                            className="small-button"
                            title="quote reply"
                            disabled={isSubmitting}
                        >
                            <i className="fa-solid fa-quote-left"></i>
                        </button>
                        <button 
                            onClick={() => onReply(comment, elementId)}
                            className="small-button"
                            title="reply"
                            disabled={isSubmitting}
                        >
                            <i className="fa-solid fa-reply"></i>
                        </button>
                    </>)
                }
                {
                    !isDashboard && (user.id === comment.user.id) && (
                    <>
                    {
                        isEditing ? (<>
                            <button
                                className="small-button"
                                onClick={handleCommentUpdate}
                                title="save"
                                disabled={isSubmitting}
                            >
                                <i className="fa-solid fa-floppy-disk"></i>
                            </button>  
                            <button
                                className="small-button"
                                onClick={handleEditCancel}
                                title="cancel"
                                disabled={isSubmitting}
                            >
                                <i className="fa-solid fa-arrow-rotate-left"></i>
                            </button> 
                        </>):(
                        <EditButton
                            className="small-button"
                            onClick={handleCommentEdit}
                            disabled={isSubmitting}
                        />)
                    }
                    <button 
                        onClick={handleCommentDelete}
                        className="small-button"
                        title="delete"
                        disabled={isSubmitting}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                    </>)
                }
            </div>)
        }        
    </div>
    )
}

export default Comment;