import { useState, useEffect } from 'react';
import Layout from "../layout/Layout";
import { LoginType, useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FormField from '../common/FormField';
import CheckboxField from '../common/CheckboxField'
import OAuth from '../common/OAuth';
import UserAgreement from '../common/UserAgreement';
import { getDateString, isAlphaDash, isValidPassword, isValidEmail, getErrorMessage } from '../../utils/helpers';

function Registration()
{
    const { isAuthenticated, isLoading, registerWithEmail, 
        completeSocialProfile, refreshUser, user } = useAuth();
    const [email, setEmail] = useState('');
    const [showEmailInProfile, setShowEmailInProfile] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [username, setUsername] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [userAgrees, setUserAgrees] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formPage, setFormPage] = useState(0); 
    //0: start 
    //1: e-mail reg details 
    //2: e-mail: user-agreement
    //3: social-reg completion (including user-agreement)
    const [loginType, setLoginType] = useState(null);

    const [isEmailFieldValid, setIsEmailFieldValid] = useState(false);
    const [isPasswordFieldValid, setIsPasswordFieldValid] = useState(false);
    const [isUsernameFieldValid, setIsUsernameFieldValid] = useState(false);
    const [isBirthdateFieldValid, setIsBirthdateFieldValid] = useState(false);
    const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
    const [isUserRobot, setIsUserRobot] = useState(true);
    const [isUserHuman, setIsUserHuman] = useState(false);
    
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation(); // Hook to get current location state
    const from = location.state?.from?.pathname || '/dashboard';
    
    let formContainerClasses = "form-container";
    formContainerClasses = formPage === 1 ? formContainerClasses + " limited-width" : formContainerClasses;

    const canContinueWithEmail = email && isEmailFieldValid && !isSubmitting;
    const canRegisterWithEmail = (loginType === LoginType.Email 
        && email && username && birthdate && password && passwordConfirmation 
        && isEmailFieldValid && isUsernameFieldValid && isPasswordFieldValid 
        && arePasswordsMatching && isBirthdateFieldValid && !isSubmitting) ? true : false;
    const canCompleteSocialRegistration = username && isUsernameFieldValid && userAgrees
        && birthdate && isBirthdateFieldValid && isAuthenticated && !isSubmitting;


    // console.log("row 1:", formPage, loginType, 
    //     "row 2:", email, username, birthdate, password, passwordConfirmation,
    //     "row 3:", isEmailFieldValid, isUsernameFieldValid, isPasswordFieldValid,
    //     "row 4:", arePasswordsMatching, isBirthdateFieldValid, !isSubmitting);
    useEffect(() => 
    {
        if (!isLoading && isAuthenticated) 
        {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, from]);

    useEffect(() => 
    {
        if (location.state && location.state.message) 
        {
            const status = location?.state?.status;
            const message = location?.state?.message;
            if(status === 'social_registration_incomplete')
            {
                setFormPage(3); //social registration completion page
                setSuccess(message);
            }
            else
            {                
                setError(message);
            }
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate, user]);

    const handleEmailSubmit = async (e) => 
    {
        e.preventDefault();
        setFormPage(1);
        setLoginType(LoginType.Email);
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
        if(passwordConfirmation === "")
        {//don't show error if user hasn't entered the confirmation yet
            return;
        }
        const areMatching = password === passwordConfirmation;
        setArePasswordsMatching(areMatching);
        if(!areMatching)
        {
            setError("Password and confirmation do not match.");
        }
        else
        {
            setError("");
        }
    },[password, passwordConfirmation]);

    const handleDetailsSubmit = (e) =>
    {
        e.preventDefault();
        setFormPage(2)
    }
    const handleEmailRegistrationSubmit = async (e) => 
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try
        {
            const data = await registerWithEmail(loginType, email, username, password, 
                passwordConfirmation, birthdate, showEmailInProfile, isUserHuman, isUserRobot);
            if(data.status == 'happy_landings')
            {
                navigate("/");
                return;   
            }

            setSuccess(`Registration successful. please check your e-mail and validate your address`);
            setFormPage(3);
        }
        catch(err)
        {
            const displayErrorMessage = getErrorMessage(err);   
            setError(displayErrorMessage.trim()); // Set general form error
            console.error('Password change error:', err.response?.data || err.message || err); // Log full error for debugging
        }
        finally
        {
            setIsSubmitting(false);
        }
    };

    const handleSocialRegistrationSubmit = () =>
    {//disable non OAuth fields/buttons if OAuth reg. has started
        setIsSubmitting(true);
    //the rest is handled in OAuth.jsx
    }

    const handleSocialCompletionSubmit = async (e) =>
    {
        e.preventDefault();
        setIsSubmitting(true);
        try
        {
            const data = await completeSocialProfile(username, birthdate, showEmailInProfile, isUserHuman, isUserRobot);
            console.log("completionData", data);
            if(data.status == 'happy_landings')
            {
                navigate('/');
                return;
            }
            await refreshUser();
            console.log("reg-page: data", data);
            sessionStorage.setItem('completion_message', data.message);
            sessionStorage.setItem('completion_status', data.status);
            navigate('/dashboard', { replace: true, /*state: { status: data.status, message: data.message}*/ });
        }
        catch(err)
        {
            const msg = getErrorMessage(err);
            setError(msg);
        }
        finally
        {
            setIsSubmitting(false);
        }

    }

    return (
    <Layout>
        <div className={formContainerClasses}>
            <h1 className='centered-content no-margin'>join netart.io</h1>
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
            formPage === 0 ?
            (<>
                <div className="field-groups-container">
                    <form onSubmit={handleEmailSubmit}>    
                        <h3>type your e-mail:</h3>            
                        <div className="field-group">
                            <FormField
                                id="email"
                                placeholder="valid@email.address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onValidate={handleEmailFormatValidation}
                                disabled={isSubmitting}
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
                        setOnError={setError}
                        isSubmittingForm={isSubmitting}
                        setIsSubmittingForm={setIsSubmitting}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trimEnd())}
                            onValidate={handleEmailFormatValidation}
                            disabled={isSubmitting}
                            type="email"       
                            classes='limited-width'         
                        />
                        <CheckboxField
                            name="show-email"
                            label="show e-mail in profile?"
                            value={showEmailInProfile}
                            onChange={(e) => setShowEmailInProfile(e.target.checked)}
                            disabled={isSubmitting}
                            classes="centered"
                        />
                        <FormField
                            id="username"
                            placeholder="a-z, A-Z, 0-9, -, _"
                            label="pick a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trimEnd())}
                            onValidate={handleUsernameFormatValidation}
                            disabled={isSubmitting}
                            type="text"                 
                            classes='limited-width'        
                        />
                        <FormField 
                            id="password"
                            label="choose a password"
                            placeholder="requires: a-z, A-Z, and 0-9"
                            value={password}
                            onChange={(e) => setPassword(e.target.value.trimEnd())}
                            onValidate={handlePasswordFormatValidation}
                            disabled={isSubmitting}
                            type="password"                
                            classes='limited-width'
                        />
                        <FormField 
                            id="password-confirm"
                            label="confirm password"
                            placeholder="same as above"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value.trimEnd())}
                            disabled={isSubmitting}
                            type="password"                  
                            classes='limited-width'
                        />
                        <FormField 
                            id="birthdate"
                            label="date of birth"
                            min="1920-01-01"
                            max={getDateString()}
                            value={birthdate}
                            onValidate={handleBirthdateFormatValidation}
                            onChange={(e) => setBirthdate(e.target.value.trimEnd())}
                            disabled={isSubmitting}
                            type="date"                     
                            classes='limited-width'
                        />
                        <FormField 
                            id="website"
                            label="your website url"
                            placeholder="www.yoursite.com"
                            classes="bonus limited-width"
                        />
                        <div className="flex-row">
                            <button type="button"
                                    disabled={isSubmitting}
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
                                onAgreeChange={(e) => setUserAgrees(e.target.checked)}
                                onHumanChange={(e) => setIsUserHuman(e.target.checked)}
                                onRobotChange={(e) => setIsUserRobot(e.target.checked)}
                                agreeVal={userAgrees}
                                humanVal={isUserHuman}
                                robotVal={isUserRobot}
                                isSubmitting={isSubmitting}
                            />
                            <div className="flex-row">
                                <button type="button"
                                    disabled={isSubmitting}
                                    onClick={(e) => {e.preventDefault(); setFormPage(1);}}
                                >
                                    back
                                </button>
                                <button type="submit" 
                                    disabled={!canRegisterWithEmail || !userAgrees || isSubmitting}
                                >
                                    {isSubmitting ? 'registering...' : 'register'}
                                </button>
                            </div>
                        </form>
                    ):( //page 3!
                        <form onSubmit={handleSocialCompletionSubmit}>
                            <FormField
                                id="username"
                                placeholder="a-z, A-Z, 0-9, -, _"
                                label="pick a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.trimEnd())}
                                onValidate={handleUsernameFormatValidation}
                                disabled={isSubmitting}
                                type="text"                            
                                classes="limited-width"
                            />
                            <FormField 
                                id="birthdate"
                                label="date of birth"
                                min="1920-01-01"
                                max={getDateString()}
                                value={birthdate}
                                onValidate={handleBirthdateFormatValidation}
                                onChange={(e) => setBirthdate(e.target.value.trimEnd())}
                                disabled={isSubmitting}
                                type="date"                            
                                classes="limited-width"
                            />
                            <CheckboxField
                                name="show-email"
                                label="show e-mail address in profile?"
                                value={showEmailInProfile}
                                onChange={(e) => setShowEmailInProfile(e.target.checked)}
                                disabled={isSubmitting}
                                classes="centered"
                            />
                            <UserAgreement
                                onAgreeChange={(e) => setUserAgrees(e.target.checked)}
                                onHumanChange={(e) => setIsUserHuman(e.target.checked)}
                                onRobotChange={(e) => setIsUserRobot(e.target.checked)}
                                agreeVal={userAgrees}
                                humanVal={isUserHuman}
                                robotVal={isUserRobot}
                                isSubmitting={isSubmitting}
                            />
                            <button type="submit" disabled={!canCompleteSocialRegistration}>
                                {isSubmitting ? 'submitting...' : 'submit'}
                            </button>
                        </form>
                    )
                )                
            )
        }
        </div>
    </Layout>
    );
}

export default Registration;