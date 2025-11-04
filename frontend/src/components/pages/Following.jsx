import Layout from "../layout/Layout";
import DashboardLayout from "./dashboard/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import LoadItems from "../common/LoadItems";
import "../common/Users.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UserCircle from "../common/UserCircle";
import { getErrorMessage } from "../../utils/helpers";
const FOLLOWERS_PER_PAGE = 100;
const HEADER_TEXT = "users you follow";

function Following()
{
    const { username } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, fetchFollowing, fetchUser } = useAuth();
    const [member, setMember] = useState(null);
    const parts = location.pathname.split("/").filter(Boolean);
    const isDashboardUrl = parts[0] === "dashboard" && parts[1] === "following";
    const [isMemberSet, setIsMemberSet] = useState(false);

    useEffect(() =>
    {                
        if(username && !member && !isMemberSet)
        {
            fetchUser(username)
            .then((data) =>
            {
                setMember(data);
            })
            .catch((err) =>
            {
                console.error(getErrorMessage(err));
            });
            setIsMemberSet(true);
        }
        if(!isDashboardUrl && !username)
        {
            //console.log("um", parts);
            navigate('/login');
            return;
        }  
        setMember(user);
        setIsMemberSet(true);
    },[isDashboardUrl, username, navigate, fetchUser, setMember, user, member, isMemberSet, setIsMemberSet]);

    const content = <>
            { !isDashboardUrl && (<h2 className="centered-content"></h2>) }
            <LoadItems 
                isFullPage={true}    
                fetchMethod={async (page, user) => await fetchFollowing(user, FOLLOWERS_PER_PAGE, page)}
                renderMethod={(user) => ({user})}
                Component={UserCircle}
                itemString="users"
                fetchAmount={FOLLOWERS_PER_PAGE}
                user={member}
                classes="side-padded"
            />
            </>;

    return (
        member && (
        <Layout>
            { user ? <DashboardLayout headerText={ isDashboardUrl ? HEADER_TEXT : ""}>
                        {content}
                </DashboardLayout> : content
            }
        </Layout>)
    )
}

export default Following;