import DashboardLayout from "./DashboardLayout"
import PostForm from "./PostForm"
import { useAuth } from "../../../contexts/AuthContext"
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HiddenPostNotice from "../../common/HiddenPostNotice";
import { getErrorMessage } from "../../../utils/helpers";

function EditPost()
{
    const navigate = useNavigate();
    const { user, fetchPostToEdit } = useAuth();
    const { post_url } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() =>
    {
        if(!user)
        {
            return;
        }
        fetchPostToEdit(user.username, post_url)
        .then((p) => {console.log("p", p); setPost(p);})
        .catch((err) =>
        {
            const status = err.response?.status || err.status;
            if(status === 404)
            {
                navigate('/not-found', {replace:true});
            }
        });
    }, [user, post_url]);

    return (
    <DashboardLayout
        currentTab=""
        headerText="edit post"
    >
        {
            post?.is_hidden_by_admin && (                
            <HiddenPostNotice classes="no-margin"/>
            )
        }
        <PostForm
            isCreateForm={false}
            user={user}
            post={post}
        />
    </DashboardLayout>
    )
}

export default EditPost;