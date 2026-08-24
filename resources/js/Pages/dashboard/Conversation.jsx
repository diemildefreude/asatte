import DashboardLayout from "./DashboardLayout";
import RichTextEditor from '../../Components/common/RichTextEditor';
import '../../Components/common/RichTextEditor.css';
import "./TagsMail.css";
import axios from 'axios';
import "../DashboardProfile.css";
import { useCallback, useEffect, useRef, useState } from "react";
import UserLink from '../../Components/common/UserLink';
import FormField from '../../Components/common/FormField';
import { dehydrateEditorImagePaths, getErrorMessage, hydrateEditorImagePaths, processEditorImages, sanitizeRichHtml } from '../../utils/helpers';
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';
import Message from '../../Components/common/Message';

function Conversation({ conversation: conversationProp, addressee })
{
    
    const { props, url } = usePage();
    const conversation = conversationProp || props.conversationProp || null;
    const user = props.auth.user;
    const [recipients, setRecipients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchResultSelection, setSearchResultSelection] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    //const [isSearching, setIsSearching] = useState(false);
    const recipientSpanRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const resultsContainer = useRef(null);
    const [doesMessageExist, setDoesMessageExist] = useState(false);
    const isNew = !conversationProp && url.startsWith("/dashboard/mail/new");
    const canSubmit = (!isNew || recipients?.length > 0) && doesMessageExist;


    const [error, setError] = useState("");

    const initialRedirectConversation = useRef(conversationProp ?? null);
    const [quotedMessage, setQuotedMessage] = useState('');
    const [originalMessage, setOriginalMessage] = useState(null);
    const [originalMessageElement, setOriginalMessageElement] = useState(null);
    const [pendingScrollId, setPendingScrollId] = useState(props.flash?.new_message_id || null);
    
    let pageTitle = isNew ? "New Conversation" : "Conversation";
    let convoName = pageTitle.toLowerCase();
    convoName = conversation?.name ?? convoName;
    pageTitle = conversation?.name ?? pageTitle;

    useEffect(() =>
    {
        if(!addressee || conversation)
        {
            return;
        }
        setRecipients([addressee]);
    },[addressee, conversation]);

    useEffect(() => 
    {
        if (pendingScrollId) 
        {
            const element = document.getElementById(`message-${pendingScrollId}`);
            if (element) 
            {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                setPendingScrollId(null); // Reset the flag
            }
        }
    }, [conversation, pendingScrollId]);

    useEffect(() => {
        if (props.flash?.new_message_id) {
            setPendingScrollId(props.flash.new_message_id);
        }
    }, [props.flash?.new_message_id]);

    const handleRTEChange = useCallback((editedMessage) =>
    {
        setDoesMessageExist(editedMessage.length > 0);
        setMessage(editedMessage);
    }, []);

    const handleCandidateHover = useCallback((i) =>
    {

        setSearchResultSelection(i);
    },[setSearchResultSelection]);

    const handleRecipientKeyPresses = useCallback((e) =>
    {

        const selection = window.getSelection();
        
        let caretPosition;
        if (selection.rangeCount > 0) 
        {
            const range = selection.getRangeAt(0);
            caretPosition = range.startOffset;
        }
        if(e.key === "Backspace")
        {
            if(caretPosition === 0)
            {                
                setSearchResults([]);
                if(recipients.length > 0)
                {
                    setRecipients(prev => prev.slice(0, prev.length - 1));
                }
            }
            return;
        }
        const resultsRef = resultsContainer.current;

        if(e.key === "Escape")
        {
            e.preventDefault();
            setSearchResults([]);
            setSearchTerm("");
            setSearchResultSelection(-1);
            return;
        }
        if(e.key === "Enter" || e.key === "," || e.key === "Tab")
        {

            if(!resultsRef.children[searchResultSelection])
            {
                return;
            }            
            e.preventDefault();
            const link = resultsRef.children[searchResultSelection].querySelector("a");

            link.click();
            return;
        }
        if(e.key === "ArrowDown")
        {

            if(searchResults.length <= 0 || resultsRef.children.length <= 0)
            {
                return;
            }
            e.preventDefault();

            let newInd = searchResultSelection;
            if(newInd === -1)
            {
                newInd = 0;
            }   
            else
            {     
                newInd = (newInd + 1) % resultsRef.children.length;           
                //newInd = Math.max(0,Math.min(resultsRef.children.length - 1, newInd - 1));
            }         


            setSearchResultSelection(newInd);
            return;
        }        
        if(e.key === "ArrowUp")
        {

            if(searchResults.length <= 0 || resultsRef.children.length <= 0)
            {
                return;
            }
            e.preventDefault();

            let newInd = searchResultSelection;
            if(newInd === -1)
            {
                newInd = Math.max(0, resultsRef.children.length - 1);
            }
            else
            {
                newInd = newInd - 1;
                newInd = newInd < 0 ? newInd + resultsRef.children.length : newInd;
            }            
            setSearchResultSelection(newInd);
            return;
        }
    }, [recipients, setRecipients, searchResultSelection, 
        setSearchTerm, searchResults, setSearchResults]);

    const handleXButton = useCallback((e, ind) =>
    {
        e.preventDefault();
        setRecipients(prev => prev.filter((r,i) => i !== ind));
    }, [setRecipients])

    //user types. Set timeout. Reset timeout every time the input changes
    //timeout ends, run search
    //
    const handleRecipientSelect = useCallback((e, user) =>
    {

        e.preventDefault();
        recipientSpanRef.current.innerHTML = "";
        setSearchTerm("");
        setRecipients(prev => [...prev, user]);
        setSearchResults([]);
        setSearchResultSelection(-1);

        recipientSpanRef.current.focus();
        
    }, [setRecipients, setSearchResults, searchResultSelection]);

    const handleRecipientSearchTermChange = useCallback((e) =>
    {
        if(recipients.length >= 5)
        {
            recipientSpanRef.current.innerText = "";
            setError("You can mail up to five people.");
            return;
        }

        const search = () => 
        {
            const newVal = recipientSpanRef.current.innerText.trim();
            const hasChanged = newVal !== searchTerm;

            setSearchTerm(newVal);
            if(newVal.length <= 0)
            {
                setSearchResults([]);
                setSearchResultSelection(-1);
                return;
            }

            if(hasChanged)
            {

                axios.get(`/api/usersearch/${encodeURIComponent(newVal)}`).then((res) => res.data).then((data) =>
                {
                    const existingIds = new Set(recipients.map(r => r.id));
                    const filtered = data.filter(datum => !existingIds.has(datum.id) && datum.id !== user.id);
                    setSearchResults(filtered);
                    setSearchResultSelection(0);

                }).catch(err => console.error("Search error:", err));
            }
        }
        if(searchTimeoutRef.current)
        {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(search, 200);

    }, [searchTerm, setSearchTerm, setSearchResults, recipients, user])

    useEffect(() =>
    {
        if(!recipientSpanRef.current)
        {
            return;
        }        
        const spanRef = recipientSpanRef.current;
        spanRef.addEventListener("keydown", handleRecipientKeyPresses);
        spanRef.addEventListener("input", handleRecipientSearchTermChange);
        
        return () =>
        {
            spanRef.removeEventListener("keydown", handleRecipientKeyPresses);
            spanRef.removeEventListener("input", handleRecipientSearchTermChange);
        };
    }, [handleRecipientSearchTermChange, handleRecipientKeyPresses]);

    const handleSubmit = useCallback(async (e) =>
    {
        e.preventDefault();

        const appUrl = props.app_url;
        const dehydratedMessage = dehydrateEditorImagePaths(message, appUrl);
        const messageWithResizedImages = await processEditorImages(dehydratedMessage);
        
        setError('');
        setIsSubmitting(true);
        try
        {
            if(!isNew && conversation)
            {
                router.post('/dashboard/mail', {
                    conversation_id: conversation.id,
                    content: messageWithResizedImages,
                    parent_id: originalMessage?.id
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setMessage("");
                        setIsSubmitting(false);
                    },
                    onError: (err) => {
                        setError(getErrorMessage(err));
                        setIsSubmitting(false);
                    }
                });
            }
            else
            {
                router.post('/dashboard/mail', {
                    content: messageWithResizedImages,
                    parent_id: originalMessage?.id,
                    recipients: recipients.map(r => r.id),
                    subject: subject
                }, {
                    onSuccess: () => {
                        setMessage("");
                        setIsSubmitting(false);
                    },
                    onError: (err) => {
                        setError(getErrorMessage(err));
                        setIsSubmitting(false);
                    }
                });
            }
        }
        catch(err)
        {
            const msg = getErrorMessage(error);
            setError(msg);
            setIsSubmitting(false);
        }
    },[originalMessage, message, recipients, subject, getErrorMessage, conversation]);

    const handleDelete = useCallback(async id =>
    {
        const isConfirmed = window.confirm("Delete message?");
        if(!isConfirmed)
        {
            return;
        }
        setError('');
        setIsSubmitting(true);
        router.delete(`/dashboard/mail/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (err) => {
                setError(getErrorMessage(err));
                setIsSubmitting(false);
            }
        });
    },[]);

    const handleReply = useCallback((message, elementID, isQuote=false) =>
    {
        setOriginalMessage(message);
        setOriginalMessageElement(elementID);
        
        if(isQuote)
        {
            const appUrl = props.app_url;
            const hydrated = hydrateEditorImagePaths(message.content, appUrl);

            
            setQuotedMessage({
                ...message, 
                content: hydrated
            });
        }
    },[])

    const handleClearQuote = useCallback(() => 
    {
        setQuotedMessage(null);
    }, []);
    return ( 
    <DashboardLayout currentTab="mail">
            <PageHead title={pageTitle} />
    <div className="centered-content no-margin side-padded">            
        <h1 dangerouslySetInnerHTML={{ __html:convoName}} />
    </div>    
    {
        !isNew && (
                <div className="footnote">
            with{" "}
            {
            conversation?.other_users?.length < 1 ? (
                <span>[deleted user(s)]</span>
            ):(
                conversation?.other_users?.map((u, index) => (
                <span key={u.id}>
                    <Link href={`/${u.username}`}>
                        {u.username}
                    </Link>
                    {/* Add a comma after every user except the last one */}
                    {index < conversation.other_users.length - 1 && ", "}
                </span>
                ))
            )
        }        
        </div>)
    }    
    {
        user && user.is_email_verified ?
        ( (!isNew && !conversation) ? (
            <p className="centered-content padding-1rem">
                Loading conversation...
            </p>
        ):(<div className="messages-container">{              
        conversation && conversation?.messages?.map((message, i) => 
        {

            let parentElement = conversation.messages.findIndex(m => m.id === message.parent_id);
            parentElement = parentElement === -1 ? null : parentElement; 
            
            return <Message
                        message={message}
                        id={i}
                        key={message.id}
                        onReply={handleReply}
                        onDelete={handleDelete}
                        parentLocalId={parentElement}
                    />
        }) 
        }
        <form className="message-form" onSubmit={handleSubmit}>
            {error && (
            <div className="error">
                {error}
            </div>
            )}
            {isNew && (
            <dl className="side-padded-on-mobile">
                <dt>
                    <label className="main-label" htmlFor="">recipients</label>
                </dt>
                <dd>
                    <div className="tags-container">
                    {
                        recipients.map((r,i) => (
                            <div className="tag" key={i}>
                                <UserLink
                                    user={r} 
                                    readOnly={true}                               
                                /> <span><button 
                                    onClick={(e) => handleXButton(e, i)}
                                    className="x-button"
                                    disabled={isSubmitting}>x</button></span>
                            </div>
                        ))
                    }
                        <span
                            contentEditable
                            ref={recipientSpanRef}
                            tabIndex="0"
                        >
                        </span>
                    </div>
                </dd>
            </dl>)
            }
            {
                isNew && searchResults && (
                <div className="results-container" ref={resultsContainer}>
                {                                    
                    searchResults.map((r,i) => (
                        <div 
                            className={`tag ${searchResultSelection === i ? 'selected' : ''}`}
                            key={i} 
                            onMouseOver={() => handleCandidateHover(i)}
                        >
                            <UserLink
                                user={r}             
                                onClick={handleRecipientSelect}      
                                returnUser={true}   
                                preventDefault={true}      
                            />
                        </div>
                    ))
                }
                </div>
                )
            }
            {isNew && (
            <FormField
                id="subject"
                label="subject"
                placeholder="(optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
                type="text"
                isInline={false}
                classes="side-padded-on-mobile"
            />
            )}
            <RichTextEditor
                placeholder="your message"
                disabled={isSubmitting}
                onChange={handleRTEChange}
                value={message}
                quotedMessage={quotedMessage}
                onQuoteApplied={handleClearQuote}
            />
            <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="side-margin-on-mobile"
            >
                send
            </button>
        </form></div>))
        :(<p className="centered-content padding-1rem">
                Please verify your e-mail to begin mailing other users.
        </p>)
    }
    </DashboardLayout>
    );
}
export default Conversation;