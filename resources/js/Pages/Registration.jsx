import { useState, useEffect } from 'react';
import Layout from '../Components/layout/Layout';
import PageHead from '../Components/layout/PageHead';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import FormField from '../Components/common/FormField';
import CheckboxField from '../Components/common/CheckboxField'
import OAuth from '../Components/common/OAuth';
import UserAgreement from '../Components/common/UserAgreement';
import { getDateString, isAlphaDash, isValidPassword, isValidEmail, getErrorMessage } from '../utils/helpers';

function Registration()
{
    const LoginType = {
        Email: 'email',
        Github: 'github',
        Google: 'google'
    };

    const { props } = usePage();
    const APP_NAME = props.app_name;
    const user = props?.auth?.user ?? null;
    const isAuthenticated = !!user;
    const isLoading = false;
    
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        email: '',
        show_email_in_profile: false,
        username: '',
        password: '',
        password_confirmation: '',
        birthdate: '',
        website: '',
        is_user_human: false,
        is_user_robot: true,
        login_type: null,
        user_agrees: false,
    });

    const [isValidating, setIsValidating] = useState(false);
    const [success, setSuccess] = useState('');
    const [formPage, setFormPage] = useState(0); 

    const [isEmailFieldValid, setIsEmailFieldValid] = useState(false);
    const [isPasswordFieldValid, setIsPasswordFieldValid] = useState(false);
    const [isUsernameFieldValid, setIsUsernameFieldValid] = useState(false);
    const [isBirthdateFieldValid, setIsBirthdateFieldValid] = useState(false);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
    
    const from = props?.flash?.from || '/dashboard';
    const message = props?.flash?.message;
    
    let formContainerClasses = "form-container";
    formContainerClasses = formPage === 1 ? formContainerClasses + " limited-width" : formContainerClasses;

    const hasErrors = Object.keys(errors).length > 0;

    const canContinueWithEmail = data.email && isEmailFieldValid && !processing && !hasErrors && !isValidating;
    const canRegisterWithEmail = (data.login_type === LoginType.Email 
        && data.email && data.username && data.birthdate && data.password && data.password_confirmation 
        && isEmailFieldValid && isUsernameFieldValid && isPasswordFieldValid 
        && arePasswordsMatching && isBirthdateFieldValid && !processing && !hasErrors && !isValidating) ? true : false;
    const canCompleteSocialRegistration = data.username && isUsernameFieldValid && data.user_agrees
        && data.birthdate && isBirthdateFieldValid && isAuthenticated && !processing && !hasErrors && !isValidating;

    useEffect(() => 
    {
        if(!isLoading && isAuthenticated && !user.profile_completed)
        {
            setFormPage(3);
        }
        else if (!isLoading && isAuthenticated && user.profile_completed) 
        {
            router.visit(from, { replace: true });
        }
    }, [user, isAuthenticated, isLoading, from, formPage]);

    useEffect(() => {
        if (message) {
            const status = props?.flash?.status;
            if (status === 'social_registration_incomplete') {
                setFormPage(3); // social registration completion page
                setSuccess(message);
            } else {
                setError('general', message);
            }
        }
    }, [message, props?.flash?.status, user, setError]);

    const handleEmailSubmit = (e) => 
    {
        e.preventDefault();
        setIsValidating(true);
        router.post('/register/check', { email: data.email }, {
            preserveState: true,
            preserveScroll: true,
            only: ['errors'],
            onError: (errs) => {
                if (errs.email) setError('email', errs.email);
            },
            onSuccess: () => {
                clearErrors('email');
                setFormPage(1);
                setData('login_type', LoginType.Email);
            },
            onFinish: () => setIsValidating(false)
        });
    };

    const handleEmailFormatValidation = (proposedEmail, setFieldLocalError) => 
    {
        const isValid = isValidEmail(proposedEmail);
        if (!isValid) 
        {
            setFieldLocalError("please enter a valid email address");
        } 
        else 
        {
            setFieldLocalError('');
        }
        setIsEmailFieldValid(isValid); // Update parent's email validity state
        return isValid;
    };

    const handleUsernameFormatValidation = (proposedName, setFieldLocalError) => 
    {
        const isEmpty = proposedName.length < 1;
        const isValid = !isEmpty && isAlphaDash(proposedName);
        if (!isValid) 
        {
            if(isEmpty)
            {
                setFieldLocalError("username cannot be empty");
            }
            else
            {
                setFieldLocalError("username may only contain letters, numbers, _ and -");
            }
        } 
        else 
        {
            setFieldLocalError(''); // Clear local error if format is good
        }
        setIsUsernameFieldValid(isValid);
        return isValid;
    };

    const handlePasswordFormatValidation = (proposedPassword, setFieldLocalError) =>
    {
        const isValid = isValidPassword(proposedPassword);
        if(!isValid)
        {
            setFieldLocalError("Password must contain at least 8 characters, 1 lower-case letter, 1 upper-case letter, and 1 number.")
        }
        else
        {
            setFieldLocalError('');
        }
        setIsPasswordFieldValid(isValid);
        return isValid;
    }

    const handlePasswordConfirmValidation = (val, setFieldLocalError) => {
        const areMatching = data.password === val;
        setArePasswordsMatching(areMatching);
        if (!areMatching && val !== "") {
            setFieldLocalError("Password and confirmation do not match.");
        } else {
            setFieldLocalError("");
        }
    };

    const handleBirthdateFormatValidation = async (proposedBirthdate, setFieldLocalError) =>
    {
        const bd = new Date(proposedBirthdate);
        const today = new Date();

        let age = today.getFullYear() - bd.getFullYear();

        const monthDifference = today.getMonth() - bd.getMonth();
        const dayDifference = today.getDate() - bd.getDate();

        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0))
        {
            age--;
        }
        const isValid = age >= 13 && age < 120;
        if(!isValid)
        {
            if(age >= 120)
            {
                setFieldLocalError("Please enter your real birthdate.");
            }
            else
            {
                setFieldLocalError("you must be 13 years or older to register");
            }
        }
        else
        {
            setFieldLocalError("");
        }
        setIsBirthdateFieldValid(isValid);
        return isValid;
    }

    useEffect(() =>
    {
        if(data.password_confirmation === "")
        {
            return;
        }
        const areMatching = data.password === data.password_confirmation;
        setArePasswordsMatching(areMatching);
        if(!areMatching)
        {
            setError('password_confirmation', "Password and confirmation do not match.");
        }
        else
        {
            if (errors.password_confirmation === "Password and confirmation do not match.") {
                clearErrors('password_confirmation');
            }
        }
    },[data.password, data.password_confirmation, setError, clearErrors, errors.password_confirmation]);

    const handleDetailsSubmit = (e) =>
    {
        e.preventDefault();
        setIsValidating(true);
        router.post('/register/check', { email: data.email, username: data.username }, {
            preserveState: true,
            preserveScroll: true,
            only: ['errors'],
            onError: (errs) => {
                if (errs.email) setError('email', errs.email);
                if (errs.username) setError('username', errs.username);
            },
            onSuccess: () => {
                clearErrors('email', 'username');
                setFormPage(2);
            },
            onFinish: () => setIsValidating(false)
        });
    }

    const handleEmailRegistrationSubmit = (e) => {
        e.preventDefault();
        clearErrors('general');
        setSuccess('');
        post('/register', {
            preserveState: true,
            onError: (errs) => {
                if (errs.email || errs.username || errs.password || errs.birthdate || errs.password_confirmation) {
                    setFormPage(1);
                }
            },
            onSuccess: () => {
                // server will redirect to intended location via session auth
            }
        });
    };

    const handleSocialRegistrationSubmit = () =>
    {//disable non OAuth fields/buttons if OAuth reg. has started
    }

    const handleSocialCompletionSubmit = (e) => {
        e.preventDefault();
        clearErrors('general');
        post('/complete-social-profile', {
            preserveState: true,
            replace: true
            // onSuccess: () => {
            //     router.visit('/dashboard', { replace: true });
            // }
        });
    }

    const handleBlur = (field, value) => {
        if (value) {
            router.post('/register/check', { [field]: value }, { 
                preserveState: true, 
                preserveScroll: true, 
                only: ['errors'],
                onError: (errs) => {
                    if (errs[field]) {
                        setError(field, errs[field]);
                    }
                },
                onSuccess: () => {
                    clearErrors(field);
                }
            });
        }
    };

    const handleFormErrorUpdate = (field, msg) => {
        if (msg) {
            setError(field, msg);
        } else {
            clearErrors(field);
        }
    };

    return (
    <>
        <PageHead title="Registration" />
        <div className={formContainerClasses}>
            <h1 className='centered-content no-margin'>join {APP_NAME}</h1>
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
        {
            formPage === 0 ?
            (<>
                <div className="field-groups-container">
                    <form onSubmit={handleEmailSubmit}>    
                        <h3>type your e-mail:</h3>            
                        <div className="field-group">
                            <FormField
                                id="email"
                                placeholder="valid@email.address"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                onBlur={(e) => handleBlur('email', e.target.value)}
                                onValidate={handleEmailFormatValidation}
                                onErrorUpdate={handleFormErrorUpdate}
                                error={errors.email}
                                disabled={processing || isValidating}
                                type="email"
                            />
                            <button 
                                type="submit" 
                                disabled={!canContinueWithEmail}
                            >
                                <div className="button-content">
                                    continue with e-mail
                                </div>
                            </button>
                        </div>    
                    </form>
                    <OAuth headerText="or:"
                        onClick={handleSocialRegistrationSubmit}
                        setOnError={(msg) => setError('general', msg)}
                        isSubmittingForm={processing || isValidating}
                        setIsSubmittingForm={() => {}}
                    />
                </div>
            </>
            )
            : 
            (
                formPage === 1 ?
                (
                    <form onSubmit={handleDetailsSubmit}>
                        <FormField
                            id="email"
                            label="type your e-mail address"
                            placeholder="valid@email.address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value.trimEnd())}
                            onBlur={(e) => handleBlur('email', e.target.value)}
                            onValidate={handleEmailFormatValidation}
                            onErrorUpdate={handleFormErrorUpdate}
                            error={errors.email}
                            disabled={processing || isValidating}
                            type="email"       
                            classes='limited-width'         
                        />
                        <CheckboxField
                            name="show-email"
                            label="show e-mail in profile?"
                            value={data.show_email_in_profile}
                            onChange={(e) => setData('show_email_in_profile', e.target.checked)}
                            disabled={processing || isValidating}
                            classes="centered"
                        />
                        <FormField
                            id="username"
                            placeholder="a-z, A-Z, 0-9, -, _"
                            label="pick a username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value.trimEnd())}
                            onBlur={(e) => handleBlur('username', e.target.value)}
                            onValidate={handleUsernameFormatValidation}
                            onErrorUpdate={handleFormErrorUpdate}
                            error={errors.username}
                            disabled={processing || isValidating}
                            type="text"                 
                            classes='limited-width'        
                        />
                        <FormField 
                            id="password"
                            label="choose a password"
                            placeholder="requires: a-z, A-Z, and 0-9"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value.trimEnd())}
                            onValidate={handlePasswordFormatValidation}
                            onErrorUpdate={handleFormErrorUpdate}
                            error={errors.password}
                            disabled={processing || isValidating}
                            type="password"                
                            classes='limited-width'
                        />
                        <FormField 
                            id="password_confirmation"
                            label="confirm password"
                            placeholder="same as above"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value.trimEnd())}
                            onValidate={handlePasswordConfirmValidation}
                            onErrorUpdate={handleFormErrorUpdate}
                            error={errors.password_confirmation}
                            disabled={processing || isValidating}
                            type="password"                  
                            classes='limited-width'
                        />
                        <FormField 
                            id="birthdate"
                            label="date of birth"
                            min="1920-01-01"
                            max={getDateString()}
                            value={data.birthdate}
                            onValidate={handleBirthdateFormatValidation}
                            onChange={(e) => setData('birthdate', e.target.value.trimEnd())}
                            onErrorUpdate={handleFormErrorUpdate}
                            error={errors.birthdate}
                            disabled={processing || isValidating}
                            type="date"                     
                            classes='limited-width'
                        />
                        <FormField 
                            id="website"
                            label="your website url"
                            placeholder="www.yoursite.com"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value.trimEnd())}
                            onErrorUpdate={handleFormErrorUpdate}
                            error={errors.website}
                            disabled={processing || isValidating}
                            type="text"
                            classes="bonus limited-width"
                        />
                        <div className="flex-row">
                            <button type="button"
                                    disabled={processing || isValidating}
                                    onClick={(e) => {e.preventDefault(); setFormPage(0);}}
                                >
                                    back
                                </button>
                            <button type="submit" disabled={!canRegisterWithEmail}>
                                continue
                            </button>
                        </div>
                    </form>      
                ) : (
                    formPage === 2 ? (
                        <form onSubmit={handleEmailRegistrationSubmit}>
                            <UserAgreement
                                onAgreeChange={(e) => setData('user_agrees', e.target.checked)}
                                onHumanChange={(e) => setData('is_user_human', e.target.checked)}
                                onRobotChange={(e) => setData('is_user_robot', e.target.checked)}
                                agreeVal={data.user_agrees}
                                humanVal={data.is_user_human}
                                robotVal={data.is_user_robot}
                                isSubmitting={processing || isValidating}
                            />
                            <div className="flex-row">
                                <button type="button"
                                    disabled={processing || isValidating}
                                    onClick={(e) => {e.preventDefault(); setFormPage(1);}}
                                >
                                    back
                                </button>
                                <button type="submit" 
                                    disabled={!canRegisterWithEmail || !data.user_agrees || processing || hasErrors || isValidating}
                                >
                                    {processing || isValidating ? 'registering...' : 'register'}
                                </button>
                            </div>
                        </form>
                    ):( //page 3: Profile Completion for Social Login
                        <form onSubmit={handleSocialCompletionSubmit}>
                            <FormField
                                id="username"
                                placeholder="a-z, A-Z, 0-9, -, _"
                                label="pick a username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value.trimEnd())}
                                onBlur={(e) => handleBlur('username', e.target.value)}
                                onValidate={handleUsernameFormatValidation}
                                onErrorUpdate={handleFormErrorUpdate}
                                error={errors.username}
                                disabled={processing}
                                type="text"                            
                                classes="limited-width"
                            />
                            <FormField 
                                id="birthdate"
                                label="date of birth"
                                min="1920-01-01"
                                max={getDateString()}
                                value={data.birthdate}
                                onValidate={handleBirthdateFormatValidation}
                                onChange={(e) => setData('birthdate', e.target.value.trimEnd())}
                                onErrorUpdate={handleFormErrorUpdate}
                                error={errors.birthdate}
                                disabled={processing}
                                type="date"                            
                                classes="limited-width"
                            />
                            <CheckboxField
                                name="show-email"
                                label="show e-mail address in profile?"
                                value={data.show_email_in_profile}
                                onChange={(e) => setData('show_email_in_profile', e.target.checked)}
                                disabled={processing}
                                classes="centered"
                            />
                            <UserAgreement
                                onAgreeChange={(e) => setData('user_agrees', e.target.checked)}
                                agreeVal={data.user_agrees}
                                isSubmitting={processing}
                                isSocialLogin={true}
                            />
                            <button type="submit" disabled={!canCompleteSocialRegistration}>
                                {processing ? 'submitting...' : 'submit'}
                            </button>
                        </form>
                    )
                )                
            )
        }
        </div>
    </>
    );
}


Registration.layout = page => <Layout>{page}</Layout>;
export default Registration;