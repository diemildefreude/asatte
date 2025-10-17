import React, { useCallback, useEffect, useState } from 'react';
import './CommentSection.css';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage, getPlainCommentText, scrollToElement } from '../../utils/helpers';
import Comment from './Comment';
import { useLocation, Link } from "react-router-dom";

function CommentSection({post, likeCount})
{
    const [content, setContent] = useState("");
    const [originalComment, setOriginalComment] = useState(null);
    const [originalCommentElement, setOriginalCommentElement] = useState(null);
    const [quoteText, setQuoteText] = useState("");
    const [comments, setComments] = useState([]);
    const {createComment, isAuthenticated} = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}${location.search}`;
    const testText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    
    useEffect(() =>
    {
        setComments(post.comments);
    },[post, setComments]);

    const handleCommentSubmit = useCallback((e)=>
    {
        e.preventDefault();
        if(!post)
        {
            return;
        }
        setIsSubmitting(true);
        setSuccess('');
        setError('');

        createComment(content, post.id, originalComment?.id)
        .then((data) =>
        {
            setSuccess(data.message);
            setComments(data.comments);
            setContent('');
            setOriginalComment(null);
            setOriginalCommentElement(null);
            setIsSubmitting(false);
        })
        .catch((err) => 
        {
            const msg = getErrorMessage(err);
            setError(msg);
            setIsSubmitting(false);
        });
    },[content, post, setComments, setSuccess, setError, originalComment]);

    const handleReply = useCallback((comment, elementId, isQuote=false) =>
    {
        setSuccess('');
        setError('');
        setOriginalComment(comment);
        setOriginalCommentElement(elementId);
        
        setContent((prev) => 
        {
            let newText = prev;
            if(quoteText)
            {
                newText = newText.replace(quoteText, "");
            }            
            if(isQuote)
            {
                let formattedOriginal = "@" + comment.user.username + " wrote:\n";
                formattedOriginal += (comment.content)
                    .split("\n")
                    .map(line => `> ${line}`)
                    .join("\n") + "\n\n";    
                setQuoteText(formattedOriginal);                
                newText = formattedOriginal + newText;
            }
            else
            {
                setQuoteText('');
            }
            return newText;
        });
        
    },[setOriginalComment, setOriginalCommentElement, setSuccess, setError, quoteText, setQuoteText]);

    const handleReplyCancel = useCallback((e) =>
    {
        e.preventDefault();
        setOriginalComment(null);
        setOriginalCommentElement(null);
    },[setOriginalComment, setOriginalCommentElement]);

    return (
    <>
        <div className="icons-leave-comment-container">
            <div className="icon-group">
                <div className="icon">
                    <i className="fa-regular fa-eye"></i>
                    <span className='metric-number'> {post.view_count}</span>
                </div>
                <div className="icon">
                    <i className="fa-regular fa-comment"></i>
                    <span className='metric-number'> {comments?.length || post.comments.length}</span>
                </div>
                <div className="icon">
                    <i className="fa-regular fa-star"></i>
                    <span className='metric-number'> {likeCount}</span>
                </div>
            </div>
            <div className="leave-comment-container">
                <form onSubmit={handleCommentSubmit}>
                    <div className="header-button-container">
                        <div>
                            <h2 className={isAuthenticated ? '' : 'greyed-out'}>leave a comment</h2>
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
                            {!isAuthenticated && (
                                <div className="notice">
                                    <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to comment.
                                </div>
                            )}
                            {originalCommentElement != null && (
                                <>
                                <span className="notice thin">
                                    <a href={`${currentUrl}/${originalCommentElement}`}
                                        onClick={(e) => {e.preventDefault(); scrollToElement(currentUrl, originalCommentElement)}}
                                    >
                                        replying to {originalComment.user.username}
                                    </a> 
                                </span> <span className='error thin'>
                                    <a 
                                        href="#"
                                        onClick={handleReplyCancel}
                                    >
                                        cancel
                                    </a>
                                </span>
                                </>
                            )}
                        </div>
                        <div className="button-container">
                            <button 
                                type="submit"
                                disabled={isSubmitting || !content}
                            >
                                submit
                            </button>
                        </div>
                    </div>
                    <textarea 
                        name="comment" 
                        id="comment"
                        onChange={(e) => setContent(e.target.value)}
                        value={content}
                        disabled={!isAuthenticated}
                    />
                </form>    
            </div> 
        </div>
        <div className="comments-container">
            <h2>comments:</h2>
            {
                comments && comments.map((comment, i) =>
                {
                    let parentElement = comments.findIndex(c => c.id === comment.parent_id);
                    parentElement = parentElement === -1 ? null : parentElement; 
                    return <Comment 
                                comment={comment} 
                                key={i} 
                                id={i}
                                onReply={handleReply}
                                parentLocalId={parentElement}
                                currentUrl={currentUrl}
                                setComments={setComments}
                            />
                })
            }
        </div>
        
    </>
    );
}

export default CommentSection;