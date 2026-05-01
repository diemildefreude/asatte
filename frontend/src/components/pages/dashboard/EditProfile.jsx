import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../utils/helpers";
import AvatarSetter from "./AvatarSetter";
import ProfileItem from "../../common/ProfileItem";

function EditProfile()
{
    const { user, logout, updateProfileInfo, refreshUser } = useAuth();       
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);
    const [websiteField, setWebsiteField] = useState('');
    const [locationField, setLocationField] = useState('');
    const [editingField, setEditingField] = useState(null);

    useEffect(() =>
    {
        if(!user)
        {
            return;
        }
        setWebsiteField(user.website);
        setLocationField(user.location);
    }, [user]);

    const handleEditClick = useCallback((fieldName) => 
    {
        setEditingField(fieldName); 
        setError(''); 
        setSuccess(''); 
    }, []);

    const handleLogoutSubmit = async (e) =>
    {
        e.preventDefault();
        try
        {
            setIsSubmitting(true);
            await logout();     
            navigate(from, {replace: true});       
        }
        catch (err)
        {
            console.error('Login error in Login.jsx:', err);
        }
        finally
        {
            setIsSubmitting(false);
        }
    }

    const handleProfileChangesSubmit = async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        if(websiteField === user.website &&
            locationField === user.location
        )
        {
            setError('No changes to submit.');
            return;    
        }
        setIsSubmitting(true);

        try
        {
            await updateProfileInfo(websiteField, locationField);
            setSuccess(`Profile successfully updated.`);            
            setHasChanges(false);
            await refreshUser();
            setEditingField(null);  
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
    };
    return (
    <div className="main-info-box sticky">
        <div className="avatar-section">
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
            <h3 className="centered-content no-margin">avatar:</h3>
            <AvatarSetter user={user} setError={setError} setSuccess={setSuccess}
                isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting}
        />
        </div>
        <div className="info-section">
            <form onSubmit={handleProfileChangesSubmit}>                                    
                <ProfileItem 
                    name="username"
                    value={user.username}
                />
                <ProfileItem
                    name="website"
                    value={websiteField}
                    setValue={setWebsiteField}
                    onChange={(e) => {setHasChanges(e.target.value !== user.website); setWebsiteField(e.target.value)}}
                    isSubmitting={isSubmitting}
                    isEditingThisField={editingField === 'website'}
                    onEditClick={() => handleEditClick('website')}
                />
                <ProfileItem
                    name="location"
                    value={locationField}
                    setValue={setLocationField}
                    onChange={(e) => {setHasChanges(e.target.value !== user.location); setLocationField(e.target.value)}}
                    isSubmitting={isSubmitting}
                    isEditingThisField={editingField === 'location'}
                    onEditClick={() => handleEditClick('location')}
                />
                <div className="button-container">
                    <button onClick={handleLogoutSubmit} disabled={isSubmitting}>log out</button>
                    {
                        hasChanges && (
                            <button type="submit" disabled={isSubmitting}>save changes</button>
                        )
                    }
                </div>
                {
                    user.is_email_verified &&
                    (
                        <Link to="/password-change" className="centered-content no-margin">change password</Link>
                    )
                }
                <Link to={`/${user.username}`} className="centered-content no-margin">
                    preview profile
                </Link>
            </form>            
        </div>        
    </div>
    );
}

export default EditProfile;