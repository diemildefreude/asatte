import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout"
import PostForm from "./PostForm"
import { useAuth } from "../../../contexts/AuthContext"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HiddenPostNotice from "../../common/HiddenPostNotice";

function EditPost()
{
    const { user, fetchSinglePost } = useAuth();
    const { post_url } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() =>
    {
        if(!user)
        {
            return;
        }
        fetchSinglePost(user.username, post_url).then(setPost);
    }, [user, post_url]);

    return (
        <Layout>
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
        </Layout>
    )
}

export default EditPost;