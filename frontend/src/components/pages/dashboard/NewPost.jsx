import Layout from "../../layout/Layout";
import { useAuth } from "../../../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import PostForm from "./PostForm";

function NewPost()
{
    const { user } = useAuth();

    return ( 
    <Layout>
        <DashboardLayout currentTab="post" headerText="Make a new post.">
            <PostForm
                isCreateForm={true}
                user={user}
            />
        </DashboardLayout>
    </Layout>
    );
}
export default NewPost;