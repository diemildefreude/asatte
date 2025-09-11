import React from 'react';
import './CommentSection.css';
import UserLink from './UserLink';

function CommentSection({post})
{
    const testText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    return (
    <>
        <div className="icons-leave-comment-container">
            <div className="icon-group">
                <div className="icon">
                    <i className="fa-regular fa-eye"></i>
                    <span> 42</span>
                </div>
                <div className="icon">
                    <i className="fa-regular fa-comment"></i>
                    <span> 3</span>
                </div>
                <div className="icon">
                    <i className="fa-regular fa-star"></i>
                    <span> 10</span>
                </div>
            </div>
            <div className="leave-comment-container">
                <form action="">
                    <div className="header-button-container">
                        <h2>leave a comment</h2>
                        <div className="button-container">
                            <button>submit</button>
                        </div>
                    </div>
                    <textarea name="" id=""></textarea>
                </form>    
            </div> 
        </div>
        <div className="comments-container">
            <h2>comments:</h2>
            <div className="comment">
                <p className="post-info"><UserLink user={post.user}/> <em>on 2025.5.12</em> :                       
                </p>
                <p className="comment-text">
                    {testText}
                </p>
            </div>
            <div className="comment">
                <p className="post-info"><UserLink user={post.user}/> <em>on 2025.5.12</em> :                       
                </p>
                <p className="comment-text">
                    {testText}
                </p>
            </div>
            <div className="comment">
                <p className="post-info"><UserLink user={post.user}/> <em>on 2025.5.12</em> :                       
                </p>
                <p className="comment-text">
                    {testText}
                </p>
            </div>
            <div className="comment">
                <p className="post-info"><UserLink user={post.user}/> <em>on 2025.5.12</em> :                       
                </p>
                <p className="comment-text">
                    {testText}
                </p>
            </div>
        </div>
        
    </>
    );
}

export default CommentSection;