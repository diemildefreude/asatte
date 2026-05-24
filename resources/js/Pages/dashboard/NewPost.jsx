import { Head } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from "./DashboardLayout";
import PostForm from "./PostForm";

function NewPost()
{
    const { user } = useAuth();

    return ( 
    <DashboardLayout 
        currentTab="post" 
        headerText="new post"
    >
            <Head title="New Post" />
        {
            user && user.is_email_verified ?
            (
                <PostForm
                    isCreateForm={true}
                    user={user}
                />
            ):
            (
                <p className="centered-content padding-1rem">
                    Verify your e-mail to begin posting.
                </p>
            )
        }
        
    </DashboardLayout>
    );
}
export default NewPost;