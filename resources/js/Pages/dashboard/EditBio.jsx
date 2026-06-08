import PageHead from '../../Components/layout/PageHead';
import { useForm, usePage, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import RichTextEditor from '../../Components/common/RichTextEditor';
import EditButton from '../../Components/common/EditButton';
import { dehydrateEditorImagePaths, getErrorMessage, hydrateEditorImagePaths, processEditorImages, sanitizeRichHtml } from '../../utils/helpers';

function EditBio()
{
    const { props } = usePage();
    const user = props?.auth?.user;
    const appUrl = props.app_url;
    const flash = props?.flash || {};
    
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bio, setBio] = useState(null);
    const [initialBio, setInitialBio] = useState(null);
    const [hasBioChanged, setHasBioChanged] = useState(false);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({ bio: '' });

    useEffect(() =>
    {        
        const hydratedBio = hydrateEditorImagePaths(user?.bio, appUrl);
        setBio(hydratedBio);
        setInitialBio(hydratedBio);
        setData('bio', hydratedBio || '');
    },[user, setData]);
    
    const handleBioChange = useCallback((newBio) =>
    {
        setBio(newBio);
        setHasBioChanged(initialBio !== newBio);
    },[initialBio]);

    const handleBioSubmit = async (e) =>
    {
        e.preventDefault();
        clearErrors();
        
        const dehydratedBio = dehydrateEditorImagePaths(bio, appUrl);
        const bioWithResizedImages = await processEditorImages(dehydratedBio);

        setIsSubmitting(true);
        router.post('/update-bio', { bio: bioWithResizedImages }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const updatedBio = hydrateEditorImagePaths(page.props?.auth?.user?.bio || bioWithResizedImages, appUrl);
                setInitialBio(updatedBio);
                setBio(updatedBio);
                setHasBioChanged(false);
                setIsInEditMode(false);
            },
            onError: (err) => {
                if (err && typeof err === 'object' && !err.response && !err.message) {
                    for (const key in err) {
                        setError(key, err[key]);
                    }
                } else {
                    const displayErrorMessage = getErrorMessage(err);
                    setError('general', displayErrorMessage.trim());
                }
            },
            onFinish: () => setIsSubmitting(false)
        });
    }

    return (
        <div className="rte-container">
            <PageHead title="Edit Bio" />
            <div className="centered-header-box">            
                {
                    (isInEditMode && hasBioChanged) && (
                    <div className="left-item">
                        <button className="save-button" 
                            type="submit" 
                            disabled={isSubmitting}
                            onClick={handleBioSubmit}
                        >
                            save
                        </button>
                    </div>)
                }
                <div className="centered-content">
                    <h3>bio</h3>                    
                </div>
                <div className="right-item">
                    {!isInEditMode && (
                    <EditButton
                        onClick={(e) => {e.preventDefault(); setIsInEditMode(true)}}
                    />)}
                </div>
            </div>
            {errors.general && (
            <div className="error">
                {errors.general}
            </div>
            )}
            {flash.success_bio && (
            <div className="notice">
                {flash.success_bio}
            </div>
            )}
            {
            isInEditMode ? (
            <RichTextEditor
                isReadOnly={!isInEditMode || isSubmitting}
                onChange={handleBioChange}
                value={bio}
            />):(
            <div
                className='padded article-text'
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(bio) }}
            />
            )                
            }
        </div>
    );
}

export default EditBio;