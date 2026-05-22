import { useCallback, useEffect, useState } from "react";
import RichTextEditor from "../common/RichTextEditor";
import EditButton from "../common/EditButton";
import Layout from "../layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage, MemberType, processEditorImages, sanitizeRichHtml,
    hydrateEditorImagePaths, dehydrateEditorImagePaths } from "../../utils/helpers";
// import "./DashboardProfile.css"; //TEMP
import "../common/RichTextEditor.css";

function About()
{
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasStatementChanged, setHasStatementChanged] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [statement, setStatement] = useState(null);
    const [initialStatement, setInitialStatement] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const {user, fetchAbout, updateAbout} = useAuth();
    const isWebmaster = user ? user.member_type == MemberType.Webmaster : false;
    //console.log("user?", user);

    useEffect(() =>
    {
        fetchAbout()
        .then((data) =>
        {
            console.log("about-data", data);
            if(data.status == "about_fetched")
            {
                const hydratedStatement = hydrateEditorImagePaths(data.about.statement);
                //const sanitizedStatement = sanitizeRichHtml(hydratedStatement);
                setInitialStatement(hydratedStatement);
                setStatement(hydratedStatement);
                setDataLoaded(true);
            }
        })
        .catch((err) =>
        {
            const errMess = getErrorMessage(err);
            setError(errMess);
        });
    },[]);

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