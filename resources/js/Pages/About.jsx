import { useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from "react";
import PageHead from '../Components/layout/PageHead';
import RichTextEditor from '../Components/common/RichTextEditor';
import EditButton from '../Components/common/EditButton';
import Layout from '../Components/layout/Layout';
import { getErrorMessage, MemberType, processEditorImages, sanitizeRichHtml,
    hydrateEditorImagePaths, dehydrateEditorImagePaths } from '../utils/helpers';

function About({ about, status })
{
    const { props } = usePage();
    const flash = props?.flash || {};
    const user = props?.auth?.user;
    const isWebmaster = user ? user.member_type == MemberType.Webmaster : false;
    const appUrl = props.app_url;
    
    const initialHydratedStatement = (status === 'about_fetched' && about?.statement) ? hydrateEditorImagePaths(about.statement, appUrl) : null;
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [hasStatementChanged, setHasStatementChanged] = useState(false);
    const [statement, setStatement] = useState(initialHydratedStatement);
    const [initialStatement, setInitialStatement] = useState(initialHydratedStatement);
    const [dataLoaded, setDataLoaded] = useState(true);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        statement: initialHydratedStatement || ''
    });

    const handleStatementChange = useCallback((newStatement) =>
    {
        setStatement(newStatement);
        setHasStatementChanged(initialStatement !== newStatement);
    },[initialStatement]);

    const handleStatementUpdate = useCallback(async (e) =>
    {
        e.preventDefault();
        
        // Dehydrate before saving
        const dehydratedStatement = dehydrateEditorImagePaths(statement, appUrl);
        const statementWithResizedImages = await processEditorImages(dehydratedStatement);
        
        setData('statement', statementWithResizedImages);
        
        post('/update-about', {
            preserveState: false,
            preserveScroll: true,
            onSuccess: (page) => {
                const newAbout = page.props?.about ?? null;
                if (newAbout && newAbout.statement) {
                    const hydratedStatement = hydrateEditorImagePaths(newAbout.statement, appUrl);
                    setInitialStatement(hydratedStatement);
                    setStatement(hydratedStatement);
                }
                setHasStatementChanged(false);
                setIsInEditMode(false);
                setDataLoaded(true);
            },
            onError: (err) => {
                const displayErrorMessage = getErrorMessage(err);
                setError('general', displayErrorMessage.trim());
            }
        });
    }, [statement, post, setData, setError]);

    // Keep local editor state in sync when server props change (Inertia page swaps)
    useEffect(() => {
        const hydrated = (status === 'about_fetched' && about?.statement) ? hydrateEditorImagePaths(about.statement, appUrl) : null;
        setStatement(hydrated);
        setInitialStatement(hydrated);
        setData('statement', hydrated || '');
        setHasStatementChanged(false);
    }, [about, status]);
    // Hydrate Twitter and Instagram embeds injected via dangerouslySetInnerHTML
    useEffect(() => {
        if (!isInEditMode && statement) {
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load();
            }
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }
    }, [statement, isInEditMode]);

    return (
    <>
        <PageHead title="About"
            ogType="article"
        />
        <div className="rte-container borderless limited-width">
        {
            dataLoaded ? (
            <article>
                <div className="centered-header-box">            
                {
                    (isInEditMode && hasStatementChanged) && (
                    <div className="left-item">
                        <button className="save-button" 
                            type="submit" 
                            disabled={processing}
                            onClick={handleStatementUpdate}
                        >
                            save
                        </button>
                    </div>)
                }
                    <div className="centered-content">
                        <h1>about</h1>                    
                    </div>
                    <div className="right-item padded">
                        {!isInEditMode && isWebmaster && (
                        <EditButton
                            onClick={(e) => {e.preventDefault(); setIsInEditMode(true)}}
                        />)}
                    </div>
                </div>
                
                {errors.general && (
                <div className="error">
                    {errors.general}
                </div>
                )}
                {flash.success && (
                <div className="notice">
                    {flash.success}
                </div>
                )}
                {
                    isInEditMode ? (
                    <RichTextEditor
                        disabled={!isInEditMode || processing}
                        onChange={handleStatementChange}
                        value={statement}
                        autoFocus={true}
                        
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
    </>
    );
}


About.layout = page => <Layout>{page}</Layout>;
export default About;