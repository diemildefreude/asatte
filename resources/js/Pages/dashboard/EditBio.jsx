import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import RichTextEditor from '../../Components/common/RichTextEditor';
import EditButton from '../../Components/common/EditButton';
import { dehydrateEditorImagePaths, getErrorMessage, getImageUrlsFromDelta, hydrateEditorImagePaths, processEditorImages, sanitizeRichHtml } from '../../utils/helpers';

function EditBio()
{
    const { props } = usePage();
    const user = props?.auth?.user;
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bio, setBio] = useState(null);
    const [initialBio, setInitialBio] = useState(null);
    const [hasBioChanged, setHasBioChanged] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const form = useForm({ bio: '' });

    useEffect(() =>
    {        
        const hydratedBio = hydrateEditorImagePaths(user?.bio);
        setBio(hydratedBio);
        setInitialBio(hydratedBio);
        form.setData('bio', hydratedBio || '');
    },[user]);
    
    const handleBioChange = useCallback((newBio) =>
    {
        setBio(newBio);
        setHasBioChanged(initialBio != newBio);
    },[initialBio]);

    const handleBioSubmit = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');        
        setIsSubmitting(true);
        const dehydratedBio = dehydrateEditorImagePaths(bio);
        const bioWithResizedImages = await processEditorImages(dehydratedBio);

        form.setData('bio', bioWithResizedImages);
        form.post('/update-bio', {
            onSuccess: (page) => {
                const hydratedBio = hydrateEditorImagePaths(page.props?.auth?.user?.bio || bioWithResizedImages);
                setInitialBio(hydratedBio);
                setBio(hydratedBio);
                setSuccess(`Bio successfully updated.`);
                setHasBioChanged(false);
                setIsInEditMode(false);
            },
            onError: (err) => {
                const displayErrorMessage = getErrorMessage(err);
                setError(displayErrorMessage.trim());
            },
            onFinish: () => setIsSubmitting(false)
        });
    }

    return (
        <div className="rte-container">
            <Head title="Edit Bio" />
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