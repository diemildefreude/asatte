import { useEffect, useState } from 'react';
import RichTextEditor from '../../common/RichTextEditor';
import EditButton from '../../common/EditButton';
import { useAuth } from '../../../contexts/AuthContext';
import { getErrorMessage, getImageUrlsFromDelta, processQuillImages } from '../../../utils/helpers';

function EditBio()
{
    const { user, updateBio, refreshUser } = useAuth();
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bio, setBio] = useState(null);
    const [hasBioChanged, setHasBioChanged] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() =>
    {        
        //const bioParsed = JSON.parse(user.bio);
        setBio(user.bio);
        //console.log("bio", user.bio);
    },[user]);
    
    const handleBioChange = (newBio) =>
    {
        setBio(newBio);
        setHasBioChanged(true);
    }

    const handleBioSubmit = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        let bioJson = JSON.stringify(bio);
        if(bioJson === user.bio)
        {
            setError('No changes to submit');
            return;
        }
        setIsSubmitting(true);
        const bioWithResizedImages = await processQuillImages(bio);
        bioJson = JSON.stringify(bioWithResizedImages);
        try
        {
            await updateBio(bioJson);
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
        <div className="bio-container">
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
                <div className="centered-item">
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
            <RichTextEditor
                readOnly={!isInEditMode || isSubmitting}
                onChange={handleBioChange}
                value={bio}
            />                
            
        </div>
    );
}

export default EditBio;