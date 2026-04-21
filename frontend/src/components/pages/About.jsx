import { useCallback, useEffect, useState } from "react";
import RichTextEditor from "../common/RichTextEditor";
import EditButton from "../common/EditButton";
import Layout from "../layout/Layout";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage, MemberType, processQuillImages } from "../../utils/helpers";
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
                setStatement(data.about.statement);
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
        setHasStatementChanged(true);
    },[]);

    const handleStatementUpdate = useCallback(async (e) =>
    {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        //setDataLoaded(false);
        const statementWithResizedImages = await processQuillImages(statement);
        const statementJson = JSON.stringify(statementWithResizedImages);
        
        updateAbout(statementJson)
        .then((data) => 
        {
            setStatement(data.about.statement);
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
        <div className="rte-container-container">
            {/* <div className="rte-form"> */}
                <div className="rte-container borderless">
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
                            <h2>about</h2>                    
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
                    <RichTextEditor
                        readOnly={!isInEditMode || isSubmitting}
                        onChange={handleStatementChange}
                        key={dataLoaded ? "loaded" : "loading"}
                        value={statement}
                    />       
                </div>
            {/* </div> */}
        </div>
    </Layout>
    );
}

export default About;