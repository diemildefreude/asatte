import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from "react";
import RichTextEditor from '../Components/common/RichTextEditor';
import EditButton from '../Components/common/EditButton';
import Layout from '../Components/layout/Layout';
import { getErrorMessage, MemberType, processEditorImages, sanitizeRichHtml,
    hydrateEditorImagePaths } from '../utils/helpers';

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
    const { props } = usePage();
    const user = props?.auth?.user;
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
        const statementWithResizedImages = await processEditorImages(statement);

        router.post('/update-about', { statement: statementWithResizedImages }, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: (page) => {
                const newAbout = page.props?.about ?? null;
                if (newAbout && newAbout.statement) {
                    const hydratedStatement = hydrateEditorImagePaths(newAbout.statement);
                    setInitialStatement(hydratedStatement);
                    setStatement(hydratedStatement);
                }
                setSuccess(page.props?.flash?.success || 'About updated.');
                setHasStatementChanged(false);
                setIsInEditMode(false);
                setIsSubmitting(false);
                setDataLoaded(true);
            },
            onError: (errors) => {
                const errMess = getErrorMessage(errors);
                setError(errMess);
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false)
        });
    },[statement]);

    // Keep local editor state in sync when server props change (Inertia page swaps)
    useEffect(() => {
        const hydrated = (status === 'about_fetched' && about?.statement) ? hydrateEditorImagePaths(about.statement) : null;
        setStatement(hydrated);
        setInitialStatement(hydrated);
        setHasStatementChanged(false);
    }, [about, status]);

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