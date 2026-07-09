import { useState, useCallback, useEffect } from "react";
import { LoginType } from '../../utils/helpers';
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import { getErrorMessage } from '../../utils/helpers';
import AvatarSetter from "./AvatarSetter";
import ProfileItem from '../../Components/common/ProfileItem';
import CheckboxField from '../../Components/common/CheckboxField';

function EditProfile()
{
    const { props } = usePage();
    const user = props?.auth?.user;
    const from = props?.flash?.from || '/';
    const flash = props?.flash || {};


    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        websites: [],
        location: '',
        show_email_in_profile: false,
        accepts_emails: true,
    });

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);
    const [websitesField, setWebsitesField] = useState([]);
    const [locationField, setLocationField] = useState('');
    const [showEmailInProfile, setShowEmailInProfile] = useState(false);
    const [acceptsEmails, setAcceptsEmails] = useState(true);
    const [editingField, setEditingField] = useState(null);


    useEffect(() =>
    {
        if(!user) return;
        
        // Ensure websites is an array
        let userWebsites = [];
        if (user.websites && Array.isArray(user.websites)) {
            userWebsites = user.websites;
        } else if (typeof user.website === 'string') {
            userWebsites = [user.website];
        }

        setWebsitesField(userWebsites);
        setLocationField(user.location || '');
        setShowEmailInProfile(!!user.show_email_in_profile);
        setAcceptsEmails(!!user.accepts_emails);
        setData({
            websites: userWebsites,
            location: user.location || '',
            show_email_in_profile: !!user.show_email_in_profile,
            accepts_emails: !!user.accepts_emails,
        });
    }, [user]);

    const handleEditClick = useCallback((fieldName) => 
    {
        setEditingField(fieldName); 
        clearErrors(); 
    }, [clearErrors]);

    const handleLogoutSubmit = (e) =>
    {
        e.preventDefault();
        setIsLoggingOut(true);
        router.post('/logout', {}, 
        {
            onFinish: () => setIsLoggingOut(false)
        });
    }

    const handleProfileChangesSubmit = (e) =>
    {
        e.preventDefault();
        clearErrors();
        
        if (!hasChanges)
        {
            setError('general', 'No changes to submit.');
            return;    
        }

        const currentData = {
            websites: websitesField,
            location: locationField,
            show_email_in_profile: showEmailInProfile,
            accepts_emails: acceptsEmails,
        };

        router.post('/update-profile', currentData, 
        {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setHasChanges(false);
                setEditingField(null);
            },
            onError: (err) => {
                const displayErrorMessage = getErrorMessage(err);
                setError('general', displayErrorMessage.trim());
            }
        });
    };

    console.log("user", user);

    return (
    <div className="main-info-box transparent-background sticky">
            <PageHead title="Edit Profile" />
        <div className="avatar-section">
            {errors.general && (
            <div className="error">
                {errors.general}
            </div>
            )}
            {flash.success_profile && (
            <div className="notice">
                {flash.success_profile}
            </div>
            )}
            <h3 className="centered-content no-margin">avatar:</h3>
            <AvatarSetter user={user} />
        </div>
        <div className="info-section">
            <form onSubmit={handleProfileChangesSubmit}>                                    
                <ProfileItem 
                    name="username"
                    value={user?.username}
                />
                <ProfileItem
                    name="websites"
                    value={websitesField}
                    isArray={true}
                    maxArrayLength={3}
                    onChange={(e, idx) => {
                        const newWebsites = [...websitesField];
                        newWebsites[idx] = e.target.value;
                        setHasChanges(true); 
                        setWebsitesField(newWebsites);
                    }}
                    onAddArrayItem={() => {
                        if (websitesField.length < 3) {
                            setWebsitesField([...websitesField, '']);
                            setHasChanges(true);
                        }
                    }}
                    disabled={!user?.is_email_verified || processing}
                    isEditingThisField={editingField === 'websites'}
                    onEditClick={() => handleEditClick('websites')}
                />
                <ProfileItem
                    name="location"
                    value={locationField}
                    setValue={setLocationField}
                    onChange={(e) => {setHasChanges(e.target.value !== user.location); setLocationField(e.target.value)}}
                    disabled={!user?.is_email_verified || processing}
                    isEditingThisField={editingField === 'location'}
                    onEditClick={() => handleEditClick('location')}
                />
                <ProfileItem 
                    name="email"
                    value={user?.email}
                />
                <CheckboxField
                    name="show-email"
                    label="show e-mail in profile:"
                    value={showEmailInProfile}
                    onChange={(e) => {setHasChanges(e.target.checked !== !!user.show_email_in_profile); setShowEmailInProfile(e.target.checked);}}
                    disabled={!user?.is_email_verified || processing}
                />
                <CheckboxField
                    name="accepts-emails"
                    label="accept e-mail notifications:"
                    value={acceptsEmails}
                    onChange={(e) => {setHasChanges(e.target.checked !== !!user.accepts_emails); setAcceptsEmails(e.target.checked);}}
                    disabled={!user?.is_email_verified || processing}
                />
                <div className="flex-row">
                    <div className="button-container">
                        <button onClick={handleLogoutSubmit} disabled={processing || isLoggingOut}>log out</button>
                        {
                            hasChanges && (
                                <button type="submit" disabled={processing}>save changes</button>
                            )
                        }
                    </div>
                    <div className="flex-column">
                    {
                        (user?.is_email_verified && user?.login_type == LoginType.Email) &&
                        (
                            <Link href="/password-change" className="centered-content no-margin">change password</Link>
                        )
                    }
                    <Link href={`/${user?.username}`} className="centered-content no-margin">
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