import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from "react";
import RichTextEditor from '../Components/common/RichTextEditor';
import EditButton from '../Components/common/EditButton';
import Layout from '../Components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage, MemberType, processEditorImages, sanitizeRichHtml,
    hydrateEditorImagePaths, dehydrateEditorImagePaths } from '../utils/helpers';
// import "./DashboardProfile.css"; //TEMP
import '../Components/common/RichTextEditor.css';

function About({ about, status })
{
    const initialHydratedStatement = (status === 'about_fetched' && about?.statement) ? hydrateEditorImagePaths(about.statement) : null;
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasStatementChanged, setHasStatementChanged] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statement, setStatement] = useState(initialHydratedStatement);
    const [initialStatement, setInitialStatement] = useState(initialHydratedStatement);
    const [dataLoaded, setDataLoaded] = useState(true);
    const {user, updateAbout} = useAuth();
    const isWebmaster = user ? user.member_type == MemberType.Webmaster : false;
    //console.log("user?", user);

    const handleStatementChange = useCallback((newStatement) =>
    {
        setStatement(newStatement);
        //console.log("new Statement", newStatement);
        setHasStatementChanged(initialStatement != newStatement);

    },[initialStatement]);

    const handleStatementUpdate = useCallback(async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        //setDataLoaded(false);
        const dehydratedStatement = dehydrateEditorImagePaths(statement);
        const statementWithResizedImages = await processEditorImages(dehydratedStatement);
        //console.log("swri?", statementWithResizedImages);
        //return;
        //const statementJson = JSON.stringify(statementWithResizedImages);
        
        updateAbout(statementWithResizedImages)
        .then((data) => 
        {
            const hydratedStatement = hydrateEditorImagePaths(data.about.statement);
            setInitialStatement(hydratedStatement);
            setStatement(hydratedStatement);
            setSuccess(data.message);
            setHasStatementChanged(false);
            setIsInEditMode(false);
            setIsSubmitting(false);
            setDataLoaded(true);
        })
        .catch((err) =>
        {
            const errMess = getErrorMessage(err);
            setError(errMess);
            setIsSubmitting(false);
        });
    },[statement]);

    return (
    <Layout>
            <Head title="About" />
        <div className="rte-container borderless">
        {
            dataLoaded ? (
            <article>
                <div className="centered-header-box">            
                {
                    (isInEditMode && hasStatementChanged) && (
                    <div className="left-item">
                        <button className="save-button" 
                            type="submit" 
                            disabled={isSubmitting}
                            onClick={handleStatementUpdate}
                        >
                            save
                        </button>
                    </div>)
                }
                    <div className="centered-content">
                        <h1>about</h1>                    
                    </div>
                    <div className="right-item">
                        {!isInEditMode && isWebmaster && (
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
                {
                    isInEditMode ? (
                    <RichTextEditor
                        isReadOnly={!isInEditMode || isSubmitting}
                        onChange={handleStatementChange}
                        value={statement}
                    />  
                    ):(
                        <div
                            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(statement) }}
                            className="article-text"
                        />
                    )
                }    
            </article>):(
                <p className="centered-content">loading...</p>
            )
        }
        </div>
    </Layout>
    );
}

export default About;