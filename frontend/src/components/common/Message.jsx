import { getDateAsYYYYMMDD, getErrorMessage, getTimeAsHHMM, processQuillImages, scrollToElement } from "../../utils/helpers";
import UserLink from "./UserLink";
import { useAuth } from "../../contexts/AuthContext";
import EditButton from "./EditButton";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CommentsNotifications.css";
import RichTextEditor from "./RichTextEditor";

function Message({message, onReply=null, onDelete=null, id, parentLocalId=null, 
    currentUrl=null, setConversation=null, quoteText=""})
{
    const {user, updateDM} = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState(message.content);
    const elementId = `message-${id}`;
    const parentElementId = parentLocalId ? `message-${parentLocalId}` : null;
    const [hasChanged, setHasChanged] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const handleMessageEdit = useCallback(() =>
    {
        setIsEditing(true);
        //setContent(message.content);
    },[]);//setIsEditing, setContent, comment]);

    const handleEditCancel = useCallback(() =>
    {
        const isConfirmed = window.confirm("Revert changes?");
        if(!isConfirmed)
        {
            return;
        }
        setIsEditing(false);
        console.log("m.c", message.content);
        setContent(message.content);　//reset ??
        setResetKey(k => k + 1);
    },[message.content]);

    const handleMessageUpdate = useCallback(async () =>
    {
        setIsSubmitting(true);
        const newContentWithResizedImages = await processQuillImages(content);
        const newContentJson = JSON.stringify(newContentWithResizedImages);
        updateDM(message.id, newContentJson)
        .then((data) =>
        {
            //console.log(data.message);
            setIsSubmitting(false);
            setIsEditing(false);
            console.log("data?", data);
            setConversation(data.conversation);
        })
        .catch((err) =>
        {
            const msg = getErrorMessage(err);
            console.error(msg);            
            setIsSubmitting(false);
        });
    },[content, setIsSubmitting, updateDM, message, setIsEditing, setConversation]);

    useEffect(() => 
    {
        setContent(message.content);
        setHasChanged(false);
        setResetKey(k => k + 1); // force Quill rehydrate
    }, [message.content]);

    return (
    <div className="comment" id={elementId}>
        <p>
            <UserLink user={message.sender}/> <em>on {getDateAsYYYYMMDD(message.created_at)}
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
        {
            message.parent_id && (parentLocalId != null) && currentUrl ? (
                <span className="notice small"> replied to <a 
                    href={`${currentUrl}/message-${parentLocalId}`}
                    onClick={(e) => {e.preventDefault(); scrollToElement(currentUrl, parentElementId)}}
                >
                    this</a> message
                </span>
            ) : null
        }
        </div>
        <RichTextEditor
            id={id}
            readOnly={!isEditing || isSubmitting}
            onChange={(editedMessage) => {setHasChanged(true); setContent(editedMessage)}}
            value={content}
            quoteText={quoteText}
            resetKey={resetKey}
        />
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
                {/* <button 
                    onClick={() => onReply(message, elementId)}
                    className="small-button"
                    title="reply"
                    disabled={isSubmitting}
                >
                    <i className="fa-solid fa-reply"></i>
                </button> */}
            </>)
            }
            {
                (user.id === message.sender.id) && (<>
                {
                    isEditing ? (<>
                        <button
                            className="small-button"
                            onClick={handleMessageUpdate}
                            title="save"
                            disabled={isSubmitting || !hasChanged}
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

export default Message;