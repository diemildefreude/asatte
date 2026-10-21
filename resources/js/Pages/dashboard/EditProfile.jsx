import { useState, useCallback, useEffect } from "react";
import { LoginType, PageTheme } from '../../utils/helpers';
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
        email_news: true,
        email_dm: true,
        email_comment: true,
        email_comment_reply: true,
        email_follower: true,
        email_like: true,
        theme: 'default',
    });
    
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);
    const [websitesField, setWebsitesField] = useState([]);
    const [locationField, setLocationField] = useState('');
    const [showEmailInProfile, setShowEmailInProfile] = useState(false);
    const [emailNews, setEmailNews] = useState(true);
    const [emailDm, setEmailDm] = useState(true);
    const [emailComment, setEmailComment] = useState(true);
    const [emailCommentReply, setEmailCommentReply] = useState(true);
    const [emailFollower, setEmailFollower] = useState(true);
    const [emailLike, setEmailLike] = useState(true);
    const [theme, setTheme] = useState('default');
    const [editingField, setEditingField] = useState(null);

    const checkHasChanges = (overrides = {}) => {
        const w = overrides.websites ?? websitesField;
        const l = overrides.location ?? locationField;
        const se = overrides.showEmailInProfile ?? showEmailInProfile;
        const en = overrides.emailNews ?? emailNews;
        const ed = overrides.emailDm ?? emailDm;
        const ec = overrides.emailComment ?? emailComment;
        const ecr = overrides.emailCommentReply ?? emailCommentReply;
        const ef = overrides.emailFollower ?? emailFollower;
        const el = overrides.emailLike ?? emailLike;
        const th = overrides.theme ?? theme;

        const originalWebsites = Array.isArray(user?.websites) ? user.websites : (user?.website ? [user.website] : []);
        const websitesChanged = JSON.stringify(w.filter(url => url && url.trim())) !== JSON.stringify(originalWebsites.filter(url => url && url.trim()));
        const locationChanged = l !== (user?.location || '');
        const showEmailChanged = se !== !!user?.show_email_in_profile;
        const newsChanged = en !== (user?.email_news ?? true);
        const dmChanged = ed !== (user?.email_dm ?? true);
        const commentChanged = ec !== (user?.email_comment ?? true);
        const replyChanged = ecr !== (user?.email_comment_reply ?? true);
        const followerChanged = ef !== (user?.email_follower ?? true);
        const likeChanged = el !== (user?.email_like ?? true);
        const themeChanged = th !== (user?.theme || 'default');

        const changed = websitesChanged || locationChanged || showEmailChanged || newsChanged || dmChanged || commentChanged || replyChanged || followerChanged || likeChanged || themeChanged;
        setHasChanges(changed);
        return changed;
    };

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
        setEmailNews(user.email_news ?? true);
        setEmailDm(user.email_dm ?? true);
        setEmailComment(user.email_comment ?? true);
        setEmailCommentReply(user.email_comment_reply ?? true);
        setEmailFollower(user.email_follower ?? true);
        setEmailLike(user.email_like ?? true);
        setTheme(user.theme || 'default');
        setData({
            websites: userWebsites,
            location: user.location || '',
            show_email_in_profile: !!user.show_email_in_profile,
            email_news: user.email_news ?? true,
            email_dm: user.email_dm ?? true,
            email_comment: user.email_comment ?? true,
            email_comment_reply: user.email_comment_reply ?? true,
            email_follower: user.email_follower ?? true,
            email_like: user.email_like ?? true,
            theme: user.theme || 'default',
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
            email_news: emailNews,
            email_dm: emailDm,
            email_comment: emailComment,
            email_comment_reply: emailCommentReply,
            email_follower: emailFollower,
            email_like: emailLike,
            theme: theme,
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

    return (
    <div className="main-info-box transparent-background sticky">
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
                        setWebsitesField(newWebsites);
                        checkHasChanges({ websites: newWebsites });
                    }}
                    onAddArrayItem={() => {
                        if (websitesField.length < 3) {
                            const newWebsites = [...websitesField, ''];
                            setWebsitesField(newWebsites);
                            checkHasChanges({ websites: newWebsites });
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
                    onChange={(e) => {
                        setLocationField(e.target.value);
                        checkHasChanges({ location: e.target.value });
                    }}
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
                    onChange={(e) => {
                        const val = e.target.checked;
                        setShowEmailInProfile(val);
                        checkHasChanges({ showEmailInProfile: val });
                    }}
                    disabled={!user?.is_email_verified || processing}
                />
                <details className="email-notifications-details">
                    <summary className="main-label">e-mail notifications</summary>
                    <div className="email-notifications-list">
                        <CheckboxField
                            name="email_news"
                            label="news article"
                            value={emailNews}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setEmailNews(val);
                                checkHasChanges({ emailNews: val });
                            }}
                            disabled={!user?.is_email_verified || processing}
                        />
                        <CheckboxField
                            name="email_dm"
                            label="mail"
                            value={emailDm}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setEmailDm(val);
                                checkHasChanges({ emailDm: val });
                            }}
                            disabled={!user?.is_email_verified || processing}
                        />
                        <CheckboxField
                            name="email_comment"
                            label="profile/post comment"
                            value={emailComment}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setEmailComment(val);
                                checkHasChanges({ emailComment: val });
                            }}
                            disabled={!user?.is_email_verified || processing}
                        />
                        <CheckboxField
                            name="email_comment_reply"
                            label="comment reply"
                            value={emailCommentReply}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setEmailCommentReply(val);
                                checkHasChanges({ emailCommentReply: val });
                            }}
                            disabled={!user?.is_email_verified || processing}
                        />
                        <CheckboxField
                            name="email_follower"
                            label="new follower"
                            value={emailFollower}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setEmailFollower(val);
                                checkHasChanges({ emailFollower: val });
                            }}
                            disabled={!user?.is_email_verified || processing}
                        />
                        <CheckboxField
                            name="email_like"
                            label="post like"
                            value={emailLike}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setEmailLike(val);
                                checkHasChanges({ emailLike: val });
                            }}
                            disabled={!user?.is_email_verified || processing}
                        />
                    </div>
                </details>
                <div className="theme-selector-details">
                    <summary className="main-label">theme</summary>
                    <div className="theme-options-grid">
                        {Object.entries(PageTheme).map(([key, value]) => (
                            <button
                                key={value}
                                type="button"
                                className={`theme-option-square ${value} ${theme === value ? 'active' : ''}`}
                                title={key.toLowerCase()}
                                disabled={!user?.is_email_verified || processing}
                                onClick={() => {
                                    setTheme(value);
                                    setData('theme', value);
                                    checkHasChanges({ theme: value });
                                }}
                            >
                            </button>
                        ))}
                    </div>
                </div>
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
                        view profile
                    </Link>

                    </div>
                </div>                
            </form>            
        </div>        
    </div>
    );
}

export default EditProfile;