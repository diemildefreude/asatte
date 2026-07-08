import React, { memo, useMemo } from 'react';
import { dehydrateEditorImagePaths, getDateAsYYYYMMDD, getErrorMessage, getTimeAsHHMM, hydrateEditorImagePaths, processEditorImages, sanitizeRichHtml, scrollToElement } from "../../utils/helpers";
import UserLink from "./UserLink";
import EditButton from "./EditButton";
import { useCallback, useEffect, useState } from "react";
import { Link, router, usePage } from '@inertiajs/react';
import "./CommentsNotifications.css";
import RichTextEditor from "./RichTextEditor";

function Message({message, onReply=null, onDelete=null, id, parentLocalId=null, 
    currentUrl=null, setConversation=null, quoteText=""})
{
    const user = usePage().props.auth?.user;
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { props } = usePage();
    const appUrl = props.app_url;
    
    const initialHydratedContent = useMemo(() => hydrateEditorImagePaths(message.content, appUrl), [message.content, appUrl]);
    
    const [content, setContent] = useState(initialHydratedContent);
    const [initialContent, setInitialContent] = useState(initialHydratedContent);
    const [hasChanged, setHasChanged] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const elementId = `message-${id}`;
    const parentElementId = parentLocalId ? `message-${parentLocalId}` : null;
    const messageSender = message.sender ?? { id: -27, username: '[deleted user]', avatar: null };

    const handleMessageEdit = useCallback(() =>
    {
        setIsEditing(true);
    },[]);

    const handleEditCancel = useCallback(() =>
    {
        if(hasChanged)
        {
            const isConfirmed = window.confirm("Revert changes?");
            if(!isConfirmed)
            {
                return;
            }
        }
        setIsEditing(false);

        setContent(initialContent);　//reset ??
        setResetKey(k => k + 1);
    },[initialContent]);

    const handleMessageUpdate = useCallback(async () =>
    {
        setIsSubmitting(true);
        const dehydratedContent = dehydrateEditorImagePaths(content, appUrl);
        const newContentWithResizedImages = await processEditorImages(dehydratedContent);
        setError("");
        router.put(`/dashboard/mail/${message.id}`, { content: newContentWithResizedImages }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setIsEditing(false);
            },
            onError: (err) => {
                console.error(err);
                const errM = getErrorMessage(err);
                setError(errM);
                setIsSubmitting(false);
            }
        });
    },[content, setIsSubmitting, message, setIsEditing]);

    useEffect(() => 
    {
        setContent(initialHydratedContent);
        setInitialContent(initialHydratedContent);
        setHasChanged(false);
        setResetKey(k => k + 1); 
    }, [initialHydratedContent]);

    console.log("content", content);
    return (
    <div className="comment dm" id={elementId}>
        <p>
            <UserLink user={messageSender}/> <em>on {getDateAsYYYYMMDD(message.created_at)}
            <span className="notice small"> at {getTimeAsHHMM(message.created_at)}</span></em>            
        </p>
        <div className="comment-notice-container">
        {            
            (message.created_at !== message.updated_at) && (
                <span className="notice small greyed-out">
                    (edited)
                </span>
            )
        }
        {error && (<span className="error"> {error}</span>)}
        </div>
        {
            isEditing ? (
                <RichTextEditor
                    id={id}
                    readOnly={!isEditing || isSubmitting}
                    onChange={(editedMessage) => {setHasChanged(editedMessage != initialContent); setContent(editedMessage)}}
                    value={content}
                    quotedMessage={quoteText}
                    resetKey={resetKey}
                />):(
                <div
                    dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
                    className="message-text"
                />
            )
        }
        
        <div className="comment-buttons-container">
        {
            !isEditing && onReply && (<>                        
            <button 
                onClick={() => onReply(message, elementId, true)}
                className="small-button"
                title="quote reply"
                disabled={isSubmitting}
            >
                <i className="fa-solid fa-quote-left"></i>
            </button>
        </>)
        }
        {
            (user.id === messageSender.id) && (<>
            {
                isEditing ? (<>
                    <button
                        className="small-button"
                        onClick={handleMessageUpdate}
                        title="save"
                        disabled={isSubmitting || !hasChanged || content.trim().length < 1}
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
                    onClick={handleMessageEdit}
                    disabled={isSubmitting}
                />)
            }                
            <button 
                onClick={() => onDelete(message.id)}
                className="small-button"
                title="delete"
                disabled={isSubmitting}
            >
                <i className="fa-regular fa-trash-can"></i>
            </button>
            </>)
        }
        </div>
    </div>
    )
}

// Compare props safely so parent keystrokes don't trigger re-renders
const areEqual = (prevProps, nextProps) => {
    return (
        prevProps.id === nextProps.id &&
        prevProps.parentLocalId === nextProps.parentLocalId &&
        prevProps.quoteText === nextProps.quoteText &&
        prevProps.message.id === nextProps.message.id &&
        prevProps.message.content === nextProps.message.content &&
        prevProps.message.updated_at === nextProps.message.updated_at
    );
};

export default React.memo(Message, areEqual);