import { useState, useCallback, useEffect } from "react";
import { LoginType } from '../../contexts/AuthContext';
import {  Link, router, usePage , Head, useForm } from '@inertiajs/react';
import { getErrorMessage } from '../../utils/helpers';
import AvatarSetter from "./AvatarSetter";
import ProfileItem from '../../Components/common/ProfileItem';
import CheckboxField from '../../Components/common/CheckboxField';

function EditProfile()
{
    const { props } = usePage();
    const user = props?.auth?.user;
    const from = props?.flash?.from || '/';

    const form = useForm({
        website: '',
        location: '',
        show_email_in_profile: false,
    });

    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);
    const [websiteField, setWebsiteField] = useState('');
    const [locationField, setLocationField] = useState('');
    const [showEmailInProfile, setShowEmailInProfile] = useState(false);
    const [editingField, setEditingField] = useState(null);

    //console.log("user",user);
    useEffect(() =>
    {
        if(!user)
        {
            return;
        }
        setWebsiteField(user.website);
        setLocationField(user.location);
        setShowEmailInProfile(user.show_email_in_profile);
        form.setData('website', user.website || '');
        form.setData('location', user.location || '');
        form.setData('show_email_in_profile', !!user.show_email_in_profile);
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
            await router.post('/logout');     
            router.visit(from, {replace: true});       
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
            locationField === user.location &&
            showEmailInProfile == user.show_email_in_profile
        )
        {
            setError('No changes to submit.');
            return;    
        }
        setIsSubmitting(true);

        form.setData('website', websiteField || '');
        form.setData('location', locationField || '');
        form.setData('show_email_in_profile', !!showEmailInProfile);

        form.post('/api/update-profile', {
            onSuccess: () => {
                setSuccess(`Profile successfully updated.`);
                setHasChanges(false);
                setEditingField(null);
                router.reload();
            },
            onError: (err) => {
                const displayErrorMessage = getErrorMessage(err);
                setError(displayErrorMessage.trim());
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };
    return (
    <div className="main-info-box sticky">
            <Head title="Edit Profile" />
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
                <ProfileItem 
                    name="email"
                    value={user.email}
                />
                <CheckboxField
                    name="show-email"
                    label="show e-mail in profile:"
                    value={showEmailInProfile}
                    onChange={(e) => {setHasChanges(e.target.checked != user.show_email_in_profile); setShowEmailInProfile(e.target.checked);}}
                    disabled={isSubmitting}
                />
                <div className="flex-row">
                    <div className="button-container">
                        <button onClick={handleLogoutSubmit} disabled={isSubmitting}>log out</button>
                        {
                            hasChanges && (
                                <button type="submit" disabled={isSubmitting}>save changes</button>
                            )
                        }
                    </div>
                    <div className="flex-column">
                    {
                        (user.is_email_verified && user.login_type == LoginType.Email) &&
                        (
                            <Link href="/password-change" className="centered-content no-margin">change password</Link>
                        )
                    }
                    <Link href={`/${user.username}`} className="centered-content no-margin">
                        preview profile
                    </Link>

                    </div>
                </div>                
            </form>            
        </div>        
    </div>
    );
}

export default EditProfile;