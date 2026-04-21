import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../contexts/AuthContext";
import FormField from "../../common/FormField";
import CheckboxField from "../../common/CheckboxField";
import RichTextEditor from "../../common/RichTextEditor";
import VideoIframe from "../../common/VideoIframe";
import ImageField from "./ImageField";
import { addImageDragListeners, getErrorMessage, getImageFilesFromInput, 
    getImageUrlFromFile, getVideoEmbedUrl, isAlphaDash, isUrl, 
    processQuillImages, resizeImage } from "../../../utils/helpers";
import "../DashboardProfile.css";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const createInitialImageFields = (post=null, user, postUrl) => 
{
    if(post) 
    {
        //console.log("poast!", post);
        const images = post.gallery_image_urls;//JSON.parse(post.gallery_image_urls);
        const alts = post.gallery_alts;//JSON.parse(post.gallery_alts);
        return images.map((image, i) => ({
            index: i,
            image: `${BACKEND_URL}/storage/images/uploaded/users/${user.username}/posts/${postUrl}/gallery/thumb/${image}`,
            alt: alts[i] == "null" ? "" : alts[i],
            value: image,
            type: 'old'
        }));
    } 
    else 
    {
        return [{
            index: 0,
            image: null,
            alt: null,
            value: null,
            type: 'new'
        }];
    }
};

function hasImages(fields)
{
    let hasImg = false;
    for(let i = 0; i < fields.length; ++i)
    {
        if(fields[i].image) //don't check the file field - old images are loaded without setting it.
        {
            hasImg = true;
            break;
        }
    }
    return hasImg;
}

function PostForm({isCreateForm=true, post=null, user})
{
    const navigate = useNavigate();
    const { createPost, updatePost, deletePost } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [postUrl, setPostUrl] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [website, setWebsite] = useState("");
    const [sourceCode, setSourceCode] = useState("");
    const [mainVideoRawUrl, setMainVideoRawUrl] = useState("");
    const [mainVideo, setMainVideo] = useState("");
    const [statement, setStatement] = useState([]);    

    const [isTitleValid, setIsTitleValid] = useState(false);
    const [isPostUrlValid, setIsPostUrlValid] = useState(false);
    const [isSubtitleValid, setIsSubtitleValid] = useState(false);
    const [isWebsiteValid, setIsWebsiteValid] = useState(false);
    const [isSourceCodeValid, setIsSourceCodeValid] = useState(false);
    const [isMainVideoValid, setIsMainVideoValid] = useState(false);
    const [hasChanged, setHasChanged] = useState(false); //for update

    const galleryContainerRef = useRef(null);    
    const [imageFields, setImageFields] = useState(createInitialImageFields(post, user, postUrl));
    const dragCounterRef = useRef(0);
    const canSubmit = title && isTitleValid && postUrl && isPostUrlValid
        && subtitle && isSubtitleValid && ((website && isWebsiteValid) || !website)
        && ((sourceCode && isSourceCodeValid) || !sourceCode)
        && imageFields.length > 0 && hasImages(imageFields) && hasChanged;    
    const buttonText = isCreateForm ? "create" : "update";
    const loadingText = "loading form...";
    const isFormReady = isCreateForm || post;
    // console.log(title, isTitleValid, postUrl, isPostUrlValid, subtitle, isSubtitleValid,
    //     website, isWebsiteValid, imageFields.length, hasImages(imageFields), hasChanged);
    // console.log("canSubmit?", canSubmit, isSubmitting, isLoading);
    
    useEffect(() =>
    {
        if(!post)
        {
            return;
        }        
        setTitle(post.title);   
        setIsTitleValid(true);
        //console.log("private?!", post.is_private);
        setIsPrivate(post.is_private);
        setPostUrl(post.post_url);
        setIsPostUrlValid(true);
        setSubtitle(post.subtitle);
        setIsSubtitleValid(true);
        if(post.website)
        {
            setWebsite(post.website);
            setIsWebsiteValid(true);
        }
        if(post.sourceCode)
        {
            setSourceCode(post.sourceCode)
            setIsWebsiteValid(true);
        }
        if(post.main_video)
        {
            setMainVideo(post.main_video);
            setIsMainVideoValid(true);
        }
        setStatement(post.statement);
        setImageFields(createInitialImageFields(post, user, post.post_url))
        setHasChanged(false);   
    },[post, setTitle, setIsPrivate, setPostUrl, setSubtitle, setWebsite, 
        setIsMainVideoValid, setMainVideo, setStatement, user]);

    const onSubmit = useCallback(async (e) =>
    {
        e.preventDefault();
        setSuccess('');
        setError('');
        //RESIZE GALLERY IMAGES
        const resizedGalleryImages = [];
        for(let i = 0; i < imageFields.length; ++i)
        {               
            const file = imageFields[i].value;
            if(!file || imageFields[i].type === 'old')
            {
                resizedGalleryImages.push(imageFields[i]);
                continue;
            }
            const resizedBlob = await resizeImage(file);
            const resizedImageFile = new File([resizedBlob], file.name, { type: file.type });
            const newField = {...imageFields[i], value: resizedImageFile};
            resizedGalleryImages.push(newField);
        };
        //RESIZE STATEMENT IMAGES
        const statementWithResizedImages = await processQuillImages(statement);
        const statementJson = JSON.stringify(statementWithResizedImages);
        try
        {
            const message = isCreateForm ? 'Post successfully created.' : 'Post successfully updated.';
            if(isCreateForm)
            {
                await createPost(postUrl, title, subtitle, website, sourceCode, mainVideo, 
                    isPrivate, statementJson, resizedGalleryImages);
                setSuccess('Post successfully created.');
            }
            else
            {
                await updatePost(post.id, postUrl, title, subtitle, website, sourceCode,
                    mainVideo, isPrivate, statementJson, resizedGalleryImages);                
                setSuccess('Post successfully updated.');
            }
            navigate('/dashboard/posts', { state:{message:message}});
            //REDIRECT TO dashboard/posts
        }
        catch(error)
        {
            const msg = getErrorMessage(error);
            setError(msg);
        }
        finally
        {
            setIsSubmitting(false);
        }
    },[setSuccess, setError, imageFields, isCreateForm, post, postUrl, 
        title, subtitle, website, mainVideo, isPrivate, statement, 
        setIsSubmitting, createPost, updatePost]);

    const handleDelete = useCallback(async () =>
    {
        setError('');
        setSuccess('');
        const isConfirmed = window.confirm("Delete post?");
        if(!isConfirmed)
        {
            return;            
        }        
        setIsSubmitting(true);
        try
        {
            await deletePost(post.id);
            navigate('/dashboard/posts', { state:{message:"Post successfully deleted."}});
        }
        catch(error)
        {
            const msg = getErrorMessage(error);
            setError(msg);
        }
        finally
        {
            setIsSubmitting(false);
        }
    },[post, navigate, setError, setIsSubmitting]);

    const handleMainVideoValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        setFieldLocalError('');
        const embedUrl = getVideoEmbedUrl(proposedUrl);
        embedUrl ? setIsMainVideoValid(true) : setIsMainVideoValid(false);
        if(embedUrl)
        {
            setMainVideo(embedUrl);
        }
        else
        {
            setFieldLocalError('Must be a valid link from YouTube, DailyMotion, Vimeo, or Youku.')
        }
    }, [setMainVideo, setIsMainVideoValid]);

    const handlePostUrlValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        const isEmpty = proposedUrl.length < 1;
        if(isEmpty)
        {
            setFieldLocalError("URL required.");
            setIsPostUrlValid(false);
            return;
        }
        const isValid = isAlphaDash(proposedUrl);
        setIsPostUrlValid(isValid);
        if(!isValid)
        {
            setFieldLocalError("URL may only contain letters, numbers, _ and -");
            return;
        }
        setFieldLocalError("");
    }, [setIsPostUrlValid]);
    const handleWebsiteValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        const isValid = isUrl(proposedUrl);
        setIsWebsiteValid(isValid);
        if(proposedUrl && !isValid)
        {
            setFieldLocalError("Not a valid URL.");
            return;
        }        
        setFieldLocalError("");
    },[setIsWebsiteValid]);
    const handleSourceCodeValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        const isValid = isUrl(proposedUrl);
        setIsSourceCodeValid(isValid);
        if(proposedUrl && !isValid)
        {
            setFieldLocalError("Not a valid URL.");
            return;
        }        
        setFieldLocalError("");
    },[setIsSourceCodeValid]);

    const handleSubtitleValidation = useCallback((proposedSubtitle, setFieldLocalError) =>
    {
        if(!proposedSubtitle)
        {
            setFieldLocalError("Subtitle required.");
            setIsSubtitleValid(false);
            return;
        }
        if(proposedSubtitle.length > 255)
        {
            setFieldLocalError("Must be less than 255 characters.")
            setIsSubtitleValid(false);
            return;
        }
        setFieldLocalError("");
        setIsSubtitleValid(true);
    }, [setIsSubtitleValid]);

    const handleTitleValidation = useCallback((proposedTitle, setFieldLocalError) =>
    {
        if(!proposedTitle)
        {
            setFieldLocalError("Title required.");
            setIsTitleValid(false);
            return;
        }
        if(proposedTitle.length > 255)
        {
            setFieldLocalError("Must be less than 255 characters.")
            setIsTitleValid(false);
            return;
        }
        setFieldLocalError("");
        setIsTitleValid(true);
    }, [setIsTitleValid]);

    const handleAddImage = useCallback(() =>
    {
        setError('');
        if(imageFields.length >= 15)
        {
            setError("Max amount of images is 15. Input truncated.");
            return;
        }        
        const newField = 
        {
            index: imageFields.length,
            image: null,
            alt: "",
            value: null,
            type: 'new'
        }        
        setImageFields(prevFields => [...prevFields, newField]);
        setHasChanged(true);
    },[imageFields, setImageFields, setHasChanged]);

    const onImageChange = useCallback((index, file, imageUrl) =>
    {
        setHasChanged(true); 
        setImageFields((prevFields) =>
        {
            return prevFields.map((field) =>
            {
                if(field.index === index)
                {
                    return {...field, value: file, image:imageUrl};
                }
                return field;
            });
        });
    }, [setImageFields, setHasChanged]);

    const onAltChange = useCallback((index, altText) =>
    {
        setHasChanged(true); 
        setImageFields((prevFields) =>
        {
            return prevFields.map((field) =>
            {
                if(field.index === index)
                {
                    return {...field, alt:altText}
                }
                return field;
            });
        });
    }, [setImageFields, setHasChanged]);

    const handleDroppedImages = useCallback(async (e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        console.log("um");
        dragCounterRef.current = 0;
        if(galleryContainerRef.current)
        {
            galleryContainerRef.current.classList.toggle('dragged-over', false);
        }
        
        setError('');
        let error = '';
        const input = getImageFilesFromInput(e);
        if(input.error)
        {
            error = input.error;
        }

        let newFields = [];
        const imagesToProcess = input.images || [];

        for (const file of imagesToProcess) 
        {
            const url = await getImageUrlFromFile(file);

            const newField = 
            {
                // The index will be assigned correctly in the state setter
                index: -1, 
                image: url,
                alt: "",
                value: file,
                type: 'new'
            };
            newFields.push(newField);
        }

        setImageFields((prevFields) =>
        {
            const combinedFields = [...prevFields, ...newFields];
            let reindexedFields = combinedFields.map((field, i) =>
            {
                return { ...field, index: i};
            })
            if(reindexedFields.length >= 15)
            {
                error = error ? error + ' ' : error;
                error += "Max amount of images is 15.";
                reindexedFields = reindexedFields.slice(0, 15);
            }
               
            setError(error);
            return reindexedFields;
        });      
        setHasChanged(true);  
    },[setImageFields, galleryContainerRef, setHasChanged]);

    useEffect(() =>
    {
        const galCont = galleryContainerRef.current;
        if(!galCont)
        {
            return;
        }
        const cleanup = addImageDragListeners(galCont, dragCounterRef, handleDroppedImages);

        return cleanup;        
    },[galleryContainerRef.current, handleDroppedImages]); //doesn't work right w/o ref.current

    return (
    <div className="main-info-delete-container">
    {     
        isFormReady ?
        (
        <>
            <div className="main-info-box stretch">
                <form onSubmit={onSubmit}>
                    <div className="text-fields-container">
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
                        <div className="footnote">
                        Fields with an * are required.
                        </div>
                        <FormField
                            id="post-url"
                            label="post url*"
                            placeholder="used in page url"
                            value={postUrl}
                            onChange={(e) => {setHasChanged(true); setPostUrl(e.target.value)}}
                            onValidate={handlePostUrlValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                        />
                        <FormField
                            id="title"
                            label="title*"
                            placeholder="work title"
                            value={title}
                            onChange={(e) => {setHasChanged(true); setTitle(e.target.value)}}
                            onValidate={handleTitleValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                        />
                        <FormField
                            id="subtitle"
                            label="subtitle*"
                            placeholder="short description"
                            value={subtitle}
                            onChange={(e) => {setHasChanged(true); setSubtitle(e.target.value)}}
                            onValidate={handleSubtitleValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                        />
                        <FormField 
                            id="website"
                            label="website"
                            placeholder="url of the work"
                            value={website}
                            onChange={(e) => {setHasChanged(true); setWebsite(e.target.value)}}
                            onValidate={handleWebsiteValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                        />
                        <FormField 
                            id="source-code"
                            label="source code"
                            placeholder="eg. Github repo"
                            value={sourceCode}
                            onChange={(e) => {setHasChanged(true); setSourceCode(e.target.value)}}
                            onValidate={handleSourceCodeValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                        />
                        <FormField
                            id="main-video"
                            label="main video"
                            placeholder="YouTube, Vimeo, DailyMotion, or Youku"
                            value={mainVideoRawUrl}
                            onChange={(e) => {setHasChanged(true); setMainVideoRawUrl(e.target.value)}}
                            onValidate={handleMainVideoValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                        />
                        {
                            isMainVideoValid && (
                                <VideoIframe url={mainVideo}/>
                            )
                        }
                        <CheckboxField name="is-private"
                            label="is private"
                            onChange={(e) => {setHasChanged(true); setIsPrivate(e.target.checked)}}
                            disabled={isSubmitting}
                            value={isPrivate}
                        />   
                        <div className="rte-container">
                            <div className="centered-content">
                                <h3>artist statement</h3>
                            </div>
                            <RichTextEditor placeholder="description of the work"
                                readOnly={isSubmitting}
                                onChange={(newStatement) => {setHasChanged(true); setStatement(newStatement)}}
                                value={statement}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting || !canSubmit}>
                            {buttonText}
                        </button>      
                    </div>            
                    <div className="multi-field-container" ref={galleryContainerRef}>                            
                        <div className="field-button-container top-align">
                            <div className="main-label-container">
                                <label className="main-label">gallery images*</label>
                                <span className="button-container">
                                    <button className="small-but" type="button" onClick={handleAddImage}>+</button>
                                </span>   
                                <p>drag & drop</p>
                            </div>                     
                        </div>
                        {
                            imageFields.map((field) =>
                            (
                                <ImageField key={field.index}
                                    index={field.index}
                                    image={field.image}
                                    file={field.type === 'new' ? field.value : null}
                                    alt={field.alt}
                                    setArray={setImageFields}
                                    onImageChange={onImageChange}
                                    onAltChange={onAltChange}
                                    onRemove={() => setHasChanged(true)}
                                />
                            ))
                        }          
                        <button type="submit" disabled={isSubmitting || !canSubmit }>
                            {buttonText}
                        </button>                                      
                    </div>  
                </form>              
            </div>        
            {
                !isCreateForm &&
                (
                    <button 
                        type="button" 
                        className="delete-button"
                        onClick={handleDelete}
                    >
                        delete
                    </button>
                )
            }
        </>
        ):
        (
            <p className='loading'>{loadingText}</p>
        )
    }  
    </div>
    );
}

export default PostForm;