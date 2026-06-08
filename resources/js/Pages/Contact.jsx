import { useForm, usePage } from '@inertiajs/react';
import PageHead from '../Components/layout/PageHead';
import Layout from '../Components/layout/Layout';
import FormField from '../Components/common/FormField';
import '../Components/common/Form.css';
import { useCallback, useState } from "react";
import { getErrorMessage, isValidEmail } from '../utils/helpers';

function Contact()
{
    const { props } = usePage();
    const flash = props?.flash || {};
    const form = useForm({
        name: '',
        email: '',
        website: '',
        subject: '',
        content: ''
    });
    const [isEmailFieldValid, setIsEmailFieldValid] = useState(false);
    const [isNameFieldValid, setIsNameFieldValid] = useState(false);
    const [isSubjectFieldValid, setIsSubjectFieldValid] = useState(false);
    const [isContentFieldValid, setIsContentFieldValid] = useState(false);
    //const [isMessageSent, setIsMessageSent] = useState(Boolean(flash.success));
    const canSubmit = form.data.email && isEmailFieldValid
                    && form.data.name && isNameFieldValid
                    && form.data.subject && isSubjectFieldValid
                    && form.data.content && isContentFieldValid;

    const handleSubmit = useCallback((e) =>
    {
        e.preventDefault();
        form.post('/contact');
    },[form]);

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
        <>
            <PageHead title="contact"/>
            <div className="form-container">
                <div className="centered-content no-margin">
                    <h1>contact</h1>
                </div>
                {flash?.error && (
                <div className="error">
                    {flash.error}
                </div>
                )}
                {flash?.success && (
                <div className="notice">
                    {flash.success}
                </div>
                )}
                {
                flash.success ? (null):(<>
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
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            onValidate={createValidationHandler(setIsNameFieldValid)}
                            disabled={form.processing}
                            error={form.errors.name}
                            onErrorUpdate={(id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id)}
                            min={2}
                            max={25}
                            type="text"
                            />
                            <FormField     
                                id="email"
                                label="email"
                                placeholder="your e-mail address"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                onValidate={handleEmailFormatValidation}
                                disabled={form.processing}
                                error={form.errors.email}
                                onErrorUpdate={(id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id)}
                                min={2}
                                max={50}
                                type="email"
                            />
                            <FormField     
                                id="website"
                                label="website"
                                placeholder="your website"
                                value={form.data.website}
                                onChange={(e) => form.setData('website', e.target.value)}
                                disabled={form.processing}
                                error={form.errors.website}
                                onErrorUpdate={(id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id)}
                                min={5}
                                max={100}
                                type="text"
                                classes="bonus"
                            />
                            <FormField     
                                id="subject"
                                label="subject"
                                placeholder="subject of inquiry"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                onValidate={createValidationHandler(setIsSubjectFieldValid)}
                                disabled={form.processing}
                                error={form.errors.subject}
                                onErrorUpdate={(id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id)}
                                min={2}
                                max={50}
                                type="text"
                            />
                        </div>                        
                        <FormField
                            id="content"
                            label="message"
                            placeholder='your message'
                            value={form.data.content}
                            onChange={(e) => form.setData('content', e.target.value)}
                            onValidate={createValidationHandler(setIsContentFieldValid)}
                            disabled={form.processing}
                            error={form.errors.content}
                            onErrorUpdate={(id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id)}
                            min={10}
                            max={1000}
                            isTextArea={true}
                        />
                    </div>
                    <button type="submit" disabled={form.processing || !canSubmit}>submit</button>
                </form></>)
                }
            </div>            
        </>
    );
}


Contact.layout = page => <Layout isDashboard={false}>{page}</Layout>;
export default Contact;
