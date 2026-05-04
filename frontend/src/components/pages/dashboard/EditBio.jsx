import { useCallback, useEffect, useState } from 'react';
import RichTextEditor from '../../common/RichTextEditor';
import EditButton from '../../common/EditButton';
import { useAuth } from '../../../contexts/AuthContext';
import { dehydrateEditorImagePaths, getErrorMessage, getImageUrlsFromDelta, hydrateEditorImagePaths, processEditorImages } from '../../../utils/helpers';

function EditBio()
{
    const { user, updateBio, refreshUser } = useAuth();
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bio, setBio] = useState(null);
    const [initialBio, setInitialBio] = useState(null);
    const [hasBioChanged, setHasBioChanged] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() =>
    {        
        //const bioParsed = JSON.parse(user.bio);
        const hydratedBio = hydrateEditorImagePaths(user.bio);
        setBio(hydratedBio);
        setInitialBio(hydratedBio);
        //console.log("bio", user.bio);
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
        //bioJson = JSON.stringify(bioWithResizedImages);
        try
        {
            const data = await updateBio(bioWithResizedImages);
            const hydratedBio = hydrateEditorImagePaths(data.bio);
            setInitialBio(hydratedBio);
            setBio(hydratedBio);
            setSuccess(`Bio successfully updated.`); 
            setHasBioChanged(false);  
            setIsInEditMode(false);
            await refreshUser();
        }
        catch(err)
        {
            const displayErrorMessage = getErrorMessage(err);
            setError(displayErrorMessage.trim());
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="rte-container">
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
                dangerouslySetInnerHTML={{ __html: bio }}
            />
            )                
            }
        </div>
    );
}

export default EditBio;