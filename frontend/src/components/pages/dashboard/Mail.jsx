import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../../../contexts/AuthContext";
import "../DashboardProfile.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../../utils/helpers";
import LoadItems from "../../common/LoadItems";
import ConversationPreview from "./common/ConversationPreview";
import DashboardCreateHeader from "./common/DashboardCreateHeader";
const FETCH_AMOUNT = 10;

function Mail()
{
    const { user, fetchConversations } = useAuth();
    //const [conversations, setConversations] = useState([]);
    const [error, setError] = useState("");
    //console.log(user);

    // useEffect(() =>
    // {
    //     if(!user)
    //     {
    //         return;
    //     }
    //     setError("");
    //     try
    //     {
    //         fetchConversations(FETCH_AMOUNT, 1)
    //         .then((conv) =>
    //         {
    //             setConversations(conv);
    //             console.log(conv);
    //         }) 
    //     }
    //     catch(err)
    //     {
    //         setError(err);
    //     }
    // },[user]);

    return ( 
    <DashboardLayout currentTab="mail">
        {
            error && (<div className="error">{error}</div>)
        }
        {                
            user && user.is_email_verified ?
            (<>
                <DashboardCreateHeader
                    headerText="mailbox"
                    createLink="/dashboard/mail/new"
                />
                <LoadItems
                    fetchMethod={async (page) => await fetchConversations(FETCH_AMOUNT, page)}
                    renderMethod={(item) =>({
                        conversation: item
                    })}
                    fetchAmount={FETCH_AMOUNT}
                    Component={ConversationPreview}
                    itemString="conversations"
                    isFullPage={true}
                    classes=""
                />
            </>)
            :(<p className="centered-content padding-1rem">
                    Please verify your e-mail to begin mailing other users.
            </p>)
        }
    </DashboardLayout>
    );
}
export default Mail;