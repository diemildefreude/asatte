import Layout from "../layout/Layout";
import FormField from "../common/FormField";
import "../common/Form.css";
import { useCallback, useState } from "react";
import { getErrorMessage, isValidEmail } from "../../utils/helpers";
import { useAuth } from "../../contexts/AuthContext";

function Contact()
{
    const { sendContactMail } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [senderEmail, setSenderEmail] = useState("");
    const [senderName, setSenderName] = useState("");
    const [senderWebsite, setSenderWebsite] = useState(""); //It's a trap!
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [isEmailFieldValid, setIsEmailFieldValid] = useState(false);
    const [isNameFieldValid, setIsNameFieldValid] = useState(false);
    const [isSubjectFieldValid, setIsSubjectFieldValid] = useState(false);
    const [isContentFieldValid, setIsContentFieldValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');    
    const [isMessageSent, setIsMessageSent] = useState(false);
    const canSubmit = senderEmail && isEmailFieldValid
                    && senderName && isNameFieldValid
                    && subject && isSubjectFieldValid
                    && content && isContentFieldValid;
    
    const handleSubmit = useCallback(async (e) =>
    {
        e.preventDefault();
        setSuccess('');
        setError('');
        try
        {
            setIsSubmitting(true);
            const data = await sendContactMail(senderName, senderEmail, subject, senderWebsite, content);
            setSuccess(data.message);
            setIsMessageSent(true);
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
    },[senderName, senderEmail, subject, senderWebsite, content]);

    const handleEmailFormatValidation = (proposedEmail, setFieldLocalError) => 
    {
        const isValid = isValidEmail(proposedEmail);
        if (!isValid) 
        {
            setFieldLocalError("enter a valid email address");
        } 
        else 
        {
            setFieldLocalError('');
        }
        setIsEmailFieldValid(isValid); // Update parent's email validity state
        return isValid;
    };

    const createValidationHandler = (setValidState) => (proposedText, setFieldLocalError) =>
    {
        const isValid = proposedText.length > 0;
        if (!isValid) 
        {
            setFieldLocalError("field required");
        } 
        else 
        {
            setFieldLocalError('');
        }
        setValidState(isValid); // Update parent's email validity state
        return isValid;
    };

    return (
        <Layout isDashboard={false}>
            <div className="form-container">
                <div className="centered-content no-margin">
                    <h1>contact</h1>
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
                isMessageSent ? (null):(<>
                <p className="centered-content no-margin">
                    Questions about the site? Send us a message.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="field-groups-container">                    
                        <div className="field-group">
                            <FormField     
                            id="name"
                            label="name"
                            placeholder="your name"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            onValidate={createValidationHandler(setIsNameFieldValid)}
                            disabled={isSubmitting}
                            min={2}
                            max={25}
                            type="text"
                            />
                            <FormField     
                                id="email"
                                label="email"
                                placeholder="your e-mail address"
                                value={senderEmail}
                                onChange={(e) => setSenderEmail(e.target.value)}
                                onValidate={handleEmailFormatValidation}
                                disabled={isSubmitting}
                                min={2}
                                max={50}
                                type="email"
                            />
                            <FormField     
                                id="website"
                                label="website"
                                placeholder="your website"
                                value={senderWebsite}
                                onChange={(e) => setSenderWebsite(e.target.value)}
                                disabled={isSubmitting}
                                min={5}
                                max={100}
                                type="text"
                                classes="bonus"
                            />
                            <FormField     
                                id="subject"
                                label="subject"
                                placeholder="subject of inquiry"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                onValidate={createValidationHandler(setIsSubjectFieldValid)}
                                disabled={isSubmitting}
                                min={2}
                                max={50}
                                type="text"
                            />
                        </div>                        
                        <FormField
                            id="content"
                            label="message"
                            placeholder='your message'
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onValidate={createValidationHandler(setIsContentFieldValid)}
                            disabled={isSubmitting}
                            min={10}
                            max={1000}
                            isTextArea={true}
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting || !canSubmit}>submit</button>
                </form></>)
                }
            </div>            
        </Layout>
    );
}

export default Contact;