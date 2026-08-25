import { getDateAsYYYYMMDD, getErrorMessage, getTimeAsHHMM, MemberType, sanitizeRichHtml, scrollToElement, getPostUrl } from "../../utils/helpers";
import UserLink from "./UserLink";
import EditButton from "./EditButton";
import { useCallback, useState } from "react";
import { Link, router, usePage, useForm } from '@inertiajs/react';
import "./CommentsNotifications.css";

function Comment({comment, isDashboard=false, onReply=null, id, parentLocalId=null, currentUrl=null, apiRoutePrefix, canDeleteAnyComment})
{
    const user = usePage().props.auth?.user;
    if (!comment) return null;
    const isAuthenticated = !!user;
    const [isEditing, setIsEditing] = useState(false);
    
    const { data, setData, put: submitUpdate, delete: submitDelete, processing, errors, clearErrors } = useForm({
        content: comment.content
    });

    const elementId = `comment-${id}`;
    const parentElementId = parentLocalId ? `comment-${parentLocalId}` : null;

    const handleCommentEdit = useCallback(() =>
    {
        setIsEditing(true);
        setData('content', comment.content);
        clearErrors();
    },[setIsEditing, setData, comment, clearErrors]);

    const handleEditCancel = useCallback(() =>
    {
        const isConfirmed = window.confirm("Revert changes?");
        if(!isConfirmed) return;
        setIsEditing(false);
        setData('content', comment.content); //reset 
    },[setIsEditing, setData, comment]);

    const handleCommentUpdate = useCallback(() =>
    {
        submitUpdate(`${apiRoutePrefix}/comments/${comment.id}`, {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false)
        });
    },[submitUpdate, comment, apiRoutePrefix]);

    const handleCommentDelete = useCallback(() =>
    {
        const isConfirmed = window.confirm("Delete comment?");
        if(!isConfirmed) return;
        submitDelete(`${apiRoutePrefix}/comments/${comment.id}`, {
            preserveScroll: true
        });
    },[submitDelete, comment, apiRoutePrefix]);

    return (
    <div className="comment" id={elementId}>
        <p>
        {
            isDashboard && comment.post ? (<>
                in <em><Link href={getPostUrl(comment.post)} //+#comment-0
                    className="bold"
                >
                    {comment.post.title}
                </Link></em> on<em> {getDateAsYYYYMMDD(comment.created_at)}
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
            isDashboard && comment.post && comment.post.user && ( //post is only included when using fetchUserComments
                <Link href={`${getPostUrl(comment.post)}?comment_id=${comment.id}`}
                    className="notice small"
                >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> go to comment
                </Link>
            )
        }
        </div>
        {
            isEditing ? (<>
                <textarea
                    name={`comment-edit-${id}`}
                    id={`comment-edit-${id}`}
                    className="comment-edit-area"
                    onChange={(e) => setData('content', e.target.value)}
                    value={data.content}
                    disabled={processing}
                />
                {errors.content && <div className="error">{errors.content}</div>}
            </>):(<div 
                className="comment-text"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(comment.content_html) }}
            >    
            </div>)
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
                            disabled={processing}
                        >
                            <i className="fa-solid fa-quote-left"></i>
                        </button>
                        <button 
                            onClick={() => onReply(comment, elementId)}
                            className="small-button"
                            title="reply"
                            disabled={processing}
                        >
                            <i className="fa-solid fa-reply"></i>
                        </button>
                    </>)
                }
                {
                    !isDashboard && (user?.id === comment?.user?.id) && (
                    <>
                    {
                        isEditing ? (<>
                            <button
                                className="small-button"
                                onClick={handleCommentUpdate}
                                title="save"
                                disabled={processing || !data.content}
                            >
                                <i className="fa-solid fa-floppy-disk"></i>
                            </button>  
                            <button
                                className="small-button"
                                onClick={handleEditCancel}
                                title="cancel"
                                disabled={processing}
                            >
                                <i className="fa-solid fa-arrow-rotate-left"></i>
                            </button> 
                        </>):(
                        <EditButton
                            className="small-button"
                            onClick={handleCommentEdit}
                            disabled={processing}
                        />)
                    }</>)
                }
                {
                    !isDashboard && (() => {
                        const isCommentOwner = user?.id === comment?.user?.id;
                        const isWebmaster = user?.member_type === MemberType.Webmaster;
                        const isAdmin = user?.member_type === MemberType.Admin;
                        const authorMemberType = comment?.user?.member_type;
                        
                        let canDelete = false;
                        if (isCommentOwner) {
                            canDelete = true;
                        } else if (canDeleteAnyComment) {
                            canDelete = true;
                        } else if (isWebmaster) {
                            canDelete = true;
                        } else if (isAdmin) {
                            if (authorMemberType !== MemberType.Webmaster && authorMemberType !== MemberType.Admin) {
                                canDelete = true;
                            }
                        }

                        return canDelete && (
                            <button 
                                onClick={handleCommentDelete}
                                className="small-button"
                                title="delete"
                                disabled={processing}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        );
                    })()
                }
            </div>)
        }        
    </div>
    )
}

export default Comment;