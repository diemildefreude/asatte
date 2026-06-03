import { useCallback, useEffect, useRef, useState } from "react";
import { Link, router, usePage, Head, useForm } from '@inertiajs/react';
import FormField from '../../Components/common/FormField';
import CheckboxField from '../../Components/common/CheckboxField';
import RichTextEditor from '../../Components/common/RichTextEditor';
import VideoIframe from '../../Components/common/VideoIframe';
import ImageField from "./ImageField";
import { addImageDragListeners, Category, dehydrateEditorImagePaths, getErrorMessage, getImageFilesFromInput, 
    getImageUrlFromFile, getVideoEmbedUrl, hydrateEditorImagePaths, isAlphaDash, isUrl, 
    MemberType, processEditorImages, resizeImage } from '../../utils/helpers';

const createInitialImageFields = (post=null, user, postUrl, appUrl) => 
{
    if(post) 
    {
        const images = post.gallery_image_urls;
        const alts = post.gallery_alts;
        return images.map((image, i) => ({
            index: i,
            image: `${appUrl}/storage/images/uploaded/users/${user.username}/posts/${postUrl}/gallery/thumb/${image}`,
            alt: alts[i] == "null" ? "" : alts[i],
            value: image,
            type: 'old'
        }));
    } 
    else 
    {
        return [{ index: 0, image: null, alt: null, value: null, type: 'new' }];
    }
};

function hasImages(fields)
{
    let hasImg = false;
    for(let i = 0; i < fields.length; ++i)
    {
        if(fields[i].image) 
        {
            hasImg = true;
            break;
        }
    }
    return hasImg;
}

function PostForm({isCreateForm=true, post=null, user, category=Category.Archive})
{
    const { props } = usePage();
    const appUrl = props.app_url;
    const hydratedStatement = post?.statement ? hydrateEditorImagePaths(post.statement, appUrl) : null;
    
    const { data, setData, errors, setError, clearErrors } = useForm({
        post_url: post?.post_url || "",
        title: post?.title || "",
        subtitle: post?.subtitle || "",
        website: post?.website || "",
        source_code: post?.sourceCode || "",
        main_video: post?.main_video || "",
        main_video_raw: post?.main_video || "",
        is_private: post ? !!post.is_private : false,
        is_news: post ? !!post.is_news : (category == Category.News),
        statement: hydratedStatement
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState("");
    const [hasChanged, setHasChanged] = useState(false);
    const [initialStatement, setInitialStatement] = useState(hydratedStatement);    

    const [isTitleValid, setIsTitleValid] = useState(!!post);
    const [isPostUrlValid, setIsPostUrlValid] = useState(!!post);
    const [isSubtitleValid, setIsSubtitleValid] = useState(!!post);
    const [isWebsiteValid, setIsWebsiteValid] = useState(true);
    const [isSourceCodeValid, setIsSourceCodeValid] = useState(true);
    const [isMainVideoValid, setIsMainVideoValid] = useState(!!post?.main_video);

    const galleryContainerRef = useRef(null);    
    const [imageFields, setImageFields] = useState(createInitialImageFields(post, user, post?.post_url || "", appUrl));
    const dragCounterRef = useRef(0);

    const canSubmit = data.title && isTitleValid && data.post_url && isPostUrlValid
        && data.subtitle && isSubtitleValid && ((data.website && isWebsiteValid) || !data.website)
        && ((data.source_code && isSourceCodeValid) || !data.source_code)
        && imageFields.length > 0 && hasImages(imageFields) && hasChanged;    

    const buttonText = isCreateForm ? "create" : "update";
    const loadingText = "loading form...";
    const isFormReady = isCreateForm || post;

    useEffect(() =>
    {
        if(!post) return;
        const hydr = hydrateEditorImagePaths(post.statement, appUrl);
        setData({
            post_url: post.post_url || "",
            title: post.title || "",
            subtitle: post.subtitle || "",
            website: post.website || "",
            source_code: post.sourceCode || "",
            main_video: post.main_video || "",
            main_video_raw: post.main_video || "",
            is_private: !!post.is_private,
            is_news: !!post.is_news,
            statement: hydr
        });
        setIsTitleValid(true);
        setIsPostUrlValid(true);
        setIsSubtitleValid(true);
        setIsWebsiteValid(true);
        setIsSourceCodeValid(true);
        setIsMainVideoValid(!!post.main_video);
        setInitialStatement(hydr);
        setImageFields(createInitialImageFields(post, user, post.post_url, appUrl));
        setHasChanged(false);   
    },[post, user, setData]);

    const onSubmit = useCallback(async (e) =>
    {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccess('');
        clearErrors();

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
        
        const dehydratedStatement = dehydrateEditorImagePaths(data.statement, appUrl);
        const statementWithResizedImages = await processEditorImages(dehydratedStatement);

        try
        {
            const message = isCreateForm ? 'Post successfully created.' : 'Post successfully updated.';
            const formData = new FormData();
            formData.append('post_url', data.post_url);
            formData.append('title', data.title);
            formData.append('subtitle', data.subtitle);
            formData.append('website', data.website || '');
            formData.append('source_code', data.source_code || '');
            formData.append('main_video', data.main_video || '');
            formData.append('is_private', data.is_private ? '1' : '0');
            formData.append('is_news', data.is_news ? '1' : '0');
            formData.append('statement', statementWithResizedImages || '');

            resizedGalleryImages.forEach((field, idx) =>
            {
                if(field.type === 'new' && field.value) {
                    formData.append(`gallery_images[${idx}][file]`, field.value);
                } else if(field.type === 'old') {
                    formData.append(`gallery_images[${idx}][url]`, field.value);
                }
                formData.append(`gallery_images[${idx}][alt]`, field.alt || '');
            });

            if(isCreateForm)
            {
                await new Promise((resolve, reject) => {
                    router.post('/posts', formData, {
                        preserveState: false,
                        preserveScroll: true,
                        onSuccess: (page) => resolve(page),
                        onError: (errs) => reject(errs),
                        onFinish: () => setIsSubmitting(false)
                    });
                });
            }
            else
            {
                formData.append('_method', 'PUT');
                await new Promise((resolve, reject) => {
                    router.post(`/posts/${post.id}`, formData, {
                        preserveState: false,
                        preserveScroll: true,
                        onSuccess: (page) => resolve(page),
                        onError: (errs) => reject(errs),
                        onFinish: () => setIsSubmitting(false)
                    });
                });
            }

            setSuccess(message);
            router.visit('/dashboard/posts', { state:{message:message}});
        }
        catch(err)
        {
            if (err && typeof err === 'object' && !err.response && !err.message) {
                for (const key in err) {
                    setError(key, err[key]);
                }
            } else {
                const msg = getErrorMessage(err);
                setError('general', msg);
            }
        }
        finally
        {
            setHasChanged(false);
            setIsSubmitting(false);
        }
    },[isCreateForm, post, data, imageFields, clearErrors, setError]);

    const handleDelete = useCallback(async () =>
    {
        clearErrors();
        setSuccess('');
        if(!window.confirm("Delete post?")) return;
        
        setIsSubmitting(true);
        try
        {
            await new Promise((resolve, reject) => {
                router.delete(`/posts/${post.id}`, {}, {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: () => resolve(),
                    onError: (errs) => reject(errs),
                    onFinish: () => setIsSubmitting(false)
                });
            });
            router.visit('/dashboard/posts', { state:{message:"Post successfully deleted."}});
        }
        catch(err)
        {
            if (err && typeof err === 'object' && !err.response && !err.message) {
                for (const key in err) {
                    setError(key, err[key]);
                }
            } else {
                const msg = getErrorMessage(err);
                setError('general', msg);
            }
        }
        finally
        {
            setIsSubmitting(false);
        }
    },[post, setError, clearErrors]);

    const handleMainVideoValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        setFieldLocalError('');
        const embedUrl = getVideoEmbedUrl(proposedUrl);
        setIsMainVideoValid(!!embedUrl);
        if(embedUrl) {
            setData('main_video', embedUrl);
        } else {
            setFieldLocalError('Must be a valid link from YouTube, DailyMotion, Vimeo, or Youku.');
        }
    }, [setData]);

    const handlePostUrlValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        if(proposedUrl.length < 1) {
            setFieldLocalError("URL required.");
            setIsPostUrlValid(false);
            return;
        }
        const isValid = isAlphaDash(proposedUrl);
        setIsPostUrlValid(isValid);
        if(!isValid) {
            setFieldLocalError("URL may only contain letters, numbers, _ and -");
            return;
        }
        setFieldLocalError("");
    }, []);

    const handleWebsiteValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        const isValid = isUrl(proposedUrl);
        setIsWebsiteValid(isValid);
        if(proposedUrl && !isValid) {
            setFieldLocalError("Not a valid URL.");
            return;
        }        
        setFieldLocalError("");
    }, []);

    const handleSourceCodeValidation = useCallback((proposedUrl, setFieldLocalError) =>
    {
        const isValid = isUrl(proposedUrl);
        setIsSourceCodeValid(isValid);
        if(proposedUrl && !isValid) {
            setFieldLocalError("Not a valid URL.");
            return;
        }        
        setFieldLocalError("");
    }, []);

    const handleSubtitleValidation = useCallback((proposedSubtitle, setFieldLocalError) =>
    {
        if(!proposedSubtitle) {
            setFieldLocalError("Subtitle required.");
            setIsSubtitleValid(false);
            return;
        }
        if(proposedSubtitle.length > 255) {
            setFieldLocalError("Must be less than 255 characters.");
            setIsSubtitleValid(false);
            return;
        }
        setFieldLocalError("");
        setIsSubtitleValid(true);
    }, []);

    const handleTitleValidation = useCallback((proposedTitle, setFieldLocalError) =>
    {
        if(!proposedTitle) {
            setFieldLocalError("Title required.");
            setIsTitleValid(false);
            return;
        }
        if(proposedTitle.length > 255) {
            setFieldLocalError("Must be less than 255 characters.");
            setIsTitleValid(false);
            return;
        }
        setFieldLocalError("");
        setIsTitleValid(true);
    }, []);

    const handleAddImage = useCallback(() =>
    {
        clearErrors('general');
        if(imageFields.length >= 15) {
            setError('general', "Max amount of images is 15. Input truncated.");
            return;
        }        
        setImageFields(prev => [...prev, { index: prev.length, image: null, alt: "", value: null, type: 'new' }]);
        setHasChanged(true);
    },[imageFields.length, setError, clearErrors]);

    const onImageChange = useCallback((index, file, imageUrl) =>
    {
        setHasChanged(true); 
        setImageFields(prev => prev.map(field => field.index === index ? {...field, value: file, image:imageUrl} : field));
    }, []);

    const onAltChange = useCallback((index, altText) =>
    {
        setHasChanged(true); 
        setImageFields(prev => prev.map(field => field.index === index ? {...field, alt:altText} : field));
    }, []);

    const handleDroppedImages = useCallback(async (e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        if(galleryContainerRef.current) galleryContainerRef.current.classList.toggle('dragged-over', false);
        
        clearErrors('general');
        let localErr = '';
        const input = getImageFilesFromInput(e);
        if(input.error) localErr = input.error;

        const imagesToProcess = input.images || [];
        let newFields = [];
        for (const file of imagesToProcess) 
        {
            const url = await getImageUrlFromFile(file);
            newFields.push({ index: -1, image: url, alt: "", value: file, type: 'new' });
        }

        setImageFields((prev) =>
        {
            let combined = [...prev, ...newFields];
            let reindexed = combined.map((f, i) => ({ ...f, index: i}));
            if(reindexed.length >= 15)
            {
                localErr = (localErr ? localErr + ' ' : '') + "Max amount of images is 15.";
                reindexed = reindexed.slice(0, 15);
            }
            if(localErr) setError('general', localErr);
            return reindexed;
        });      
        setHasChanged(true);  
    },[clearErrors, setError]);

    useEffect(() =>
    {
        const galCont = galleryContainerRef.current;
        if(!galCont) return;
        return addImageDragListeners(galCont, dragCounterRef, handleDroppedImages);
    },[handleDroppedImages]);

    return (
    <div className="main-info-delete-container">
            <Head title="Post Form" />
    {     
        isFormReady ?
        (
        <>
            <div className="main-info-box stretch">
                <form onSubmit={onSubmit}>
                    <div className="text-fields-container">
                        {errors.general && (
                        <div className="error">
                            {errors.general}
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
                            id="post_url"
                            label="post url*"
                            placeholder="used in page url"
                            value={data.post_url}
                            onChange={(e) => {setHasChanged(true); setData('post_url', e.target.value)}}
                            onValidate={handlePostUrlValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                            error={errors.post_url}
                            onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                        />
                        <FormField
                            id="title"
                            label="title*"
                            placeholder="work title"
                            value={data.title}
                            onChange={(e) => {setHasChanged(true); setData('title', e.target.value)}}
                            onValidate={handleTitleValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                            error={errors.title}
                            onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                        />
                        <FormField
                            id="subtitle"
                            label="subtitle*"
                            placeholder="short description"
                            value={data.subtitle}
                            onChange={(e) => {setHasChanged(true); setData('subtitle', e.target.value)}}
                            onValidate={handleSubtitleValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                            error={errors.subtitle}
                            onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                        />
                        <FormField 
                            id="website"
                            label="website"
                            placeholder="url of the work"
                            value={data.website}
                            onChange={(e) => {setHasChanged(true); setData('website', e.target.value)}}
                            onValidate={handleWebsiteValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                            error={errors.website}
                            onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                        />
                        <FormField 
                            id="source_code"
                            label="source code"
                            placeholder="eg. Github repo"
                            value={data.source_code}
                            onChange={(e) => {setHasChanged(true); setData('source_code', e.target.value)}}
                            onValidate={handleSourceCodeValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                            error={errors.source_code}
                            onErrorUpdate={(id, msg) => msg ? setError(id, msg) : clearErrors(id)}
                        />
                        <FormField
                            id="main_video_raw"
                            label="main video"
                            placeholder="YouTube, Vimeo, DailyMotion, or Youku"
                            value={data.main_video_raw}
                            onChange={(e) => {setHasChanged(true); setData('main_video_raw', e.target.value)}}
                            onValidate={handleMainVideoValidation}
                            disabled={isSubmitting}
                            type="text"
                            isInline={true}
                            classes="inline-form-field"
                            error={errors.main_video}
                            onErrorUpdate={(id, msg) => msg ? setError('main_video', msg) : clearErrors('main_video')}
                        />
                        {
                            isMainVideoValid && data.main_video && (
                                <VideoIframe url={data.main_video}/>
                            )
                        }
                        <CheckboxField name="is-private"
                            label="is private"
                            onChange={(e) => {setHasChanged(true); setData('is_private', e.target.checked)}}
                            disabled={isSubmitting}
                            value={data.is_private}
                        />   
                        {
                            (user.member_type == MemberType.Webmaster) && (
                            <CheckboxField name="is-news"
                                label="is news"
                                onChange={(e) => {setHasChanged(true); setData('is_news', e.target.checked)}}
                                disabled={isSubmitting}
                                value={data.is_news}
                            />   )
                        }
                        <div className="rte-container">
                            <div className="centered-content">
                                <h3>artist statement</h3>
                            </div>
                            <RichTextEditor placeholder="description of the work"
                                isReadOnly={isSubmitting}
                                onChange={(val) => {setData('statement', val); setHasChanged(val !== initialStatement);}}
                                value={data.statement}
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
                        disabled={isSubmitting}
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