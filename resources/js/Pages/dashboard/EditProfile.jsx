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
        website: '',
        location: '',
        show_email_in_profile: false,
    });

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);
    const [websiteField, setWebsiteField] = useState('');
    const [locationField, setLocationField] = useState('');
    const [showEmailInProfile, setShowEmailInProfile] = useState(false);
    const [editingField, setEditingField] = useState(null);

    //console.log("user",user);
    useEffect(() =>
    {
        if(!user) return;
        setWebsiteField(user.website || '');
        setLocationField(user.location || '');
        setShowEmailInProfile(!!user.show_email_in_profile);
        setData('website', user.website || '');
        setData('location', user.location || '');
        setData('show_email_in_profile', !!user.show_email_in_profile);
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
        router.post('/logout', {}, {
            onFinish: () => setIsLoggingOut(false)
        });
    }

    const handleProfileChangesSubmit = (e) =>
    {
        e.preventDefault();
        clearErrors();
        
        if(websiteField === user.website &&
            locationField === user.location &&
            showEmailInProfile === !!user.show_email_in_profile
        )
        {
            setError('general', 'No changes to submit.');
            return;    
        }

        setData('website', websiteField || '');
        setData('location', locationField || '');
        setData('show_email_in_profile', !!showEmailInProfile);

        // using router.post because form.post queues state updates asynchronously, 
        // so setData might not apply before form.post fires if invoked synchronously here.
        router.post('/update-profile', {
            website: websiteField || '',
            location: locationField || '',
            show_email_in_profile: !!showEmailInProfile
        }, {
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

    return (
    <div className="main-info-box sticky">
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
                    name="website"
                    value={websiteField}
                    setValue={setWebsiteField}
                    onChange={(e) => {setHasChanges(e.target.value !== user.website); setWebsiteField(e.target.value)}}
                    isSubmitting={processing}
                    isEditingThisField={editingField === 'website'}
                    onEditClick={() => handleEditClick('website')}
                />
                <ProfileItem
                    name="location"
                    value={locationField}
                    setValue={setLocationField}
                    onChange={(e) => {setHasChanges(e.target.value !== user.location); setLocationField(e.target.value)}}
                    isSubmitting={processing}
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
                    disabled={processing}
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
                        (user?.is_email_verified && user?.login_type === LoginType.Email) &&
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