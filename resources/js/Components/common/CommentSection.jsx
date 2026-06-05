import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import './CommentsNotifications.css';
import { getErrorMessage, scrollToElement } from '../../utils/helpers';
import Comment from './Comment';
import { Link, router, usePage, useForm } from '@inertiajs/react';

function CommentSection({post, likeCount})
{
    const [originalComment, setOriginalComment] = useState(null);
    const [originalCommentElement, setOriginalCommentElement] = useState(null);
    const [quoteText, setQuoteText] = useState("");
    
    const { data, setData, post: submitComment, processing, reset, errors, clearErrors } = useForm({
        content: '',
        parent_id: null
    });

    const user = usePage().props.auth?.user;
    const isAuthenticated = !!user;
    const page = usePage();
    const success = page.props.flash?.success;
    const comments = post.comments || [];
    const parsed = new URL(page.url || window.location.href, window.location.origin);
    const currentUrl = `${parsed.origin}${parsed.pathname}${parsed.search}`;
    const queryParams = new URLSearchParams(parsed.search);
    const commentId = queryParams.get('comment_id');
    const testText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    


    useEffect(() => 
    {
        if (!commentId || !comments.length) return;

        const index = comments.findIndex(c => c.id === Number(commentId));
        if (index === -1) return;

        // 1️⃣ Scroll instantly (no smooth, no double scroll)
        document.getElementById(`comment-${index}`)?.scrollIntoView();

        // 2️⃣ Clean the URL without adding a new history entry
        const params = new URLSearchParams(parsed.search);
        params.delete("comment_id");
        window.history.replaceState(
            null,
            "",
            `${parsed.pathname}?${params.toString()}#comment-${index}`
        );
    }, [commentId, comments]);



    const handleCommentSubmit = useCallback((e)=>
    {
        e.preventDefault();
        if(!post) return;
        
        submitComment(`/posts/${post.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOriginalComment(null);
                setOriginalCommentElement(null);
            }
        });
    },[data, post.id]);

    const handleReply = useCallback((comment, elementId, isQuote=false) =>
    {
        clearErrors();
        setOriginalComment(comment);
        setOriginalCommentElement(elementId);
        
        setData('parent_id', comment.id);
        
        setData('content', (prev) => 
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
        const el = document.getElementById("leave-comment-container");
        if (el) 
        {
            const rect = el.getBoundingClientRect();
            const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

            if (!isInView) 
            {
                scrollToElement(currentUrl, "leave-comment-container", false);
            }
        }
    },[setOriginalComment, setOriginalCommentElement, quoteText, setQuoteText]);

    const handleReplyCancel = useCallback((e) =>
    {
        e.preventDefault();
        setOriginalComment(null);
        setOriginalCommentElement(null);
        setData('parent_id', null);
    },[setOriginalComment, setOriginalCommentElement]);

    return ((post || comments) &&
    <>
        <div className="icons-leave-comment-container">
            <div className="icon-group">
                <div className="icon">
                    <i className="fa-regular fa-eye"></i>
                    <span className='metric-number'> {post.view_count}</span>
                </div>
                <div className="icon">
                    <i className="fa-regular fa-comment"></i>
                    <span className='metric-number'> {comments.length}</span>
                </div>
                <div className="icon">
                    <i className="fa-regular fa-star"></i>
                    <span className='metric-number'> {likeCount}</span>
                </div>
            </div>
            <div className="leave-comment-container" id="leave-comment-container">
                <form onSubmit={handleCommentSubmit}>
                    <div className="header-button-container">
                        <div>
                            <h2 className={isAuthenticated ? '' : 'greyed-out'}>leave a comment</h2>
                            {errors.content && (
                            <div className="error">
                                {errors.content}
                            </div>
                            )}
                            {success && (
                            <div className="notice">
                                {success}
                            </div>
                            )}
                            {!isAuthenticated && (
                                <div className="notice">
                                    <Link href="/login">Log in</Link> or <Link href="/register">register</Link> to comment.
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
                                disabled={processing || !data.content}
                            >
                                submit
                            </button>
                        </div>
                    </div>
                    <textarea 
                        name="comment" 
                        id="comment"
                        onChange={(e) => setData('content', e.target.value)}
                        value={data.content}
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
                            />
                })
            }
        </div>
        
    </>
    );
}

export default CommentSection;