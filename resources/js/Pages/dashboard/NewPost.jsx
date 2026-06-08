import PageHead from '../../Components/layout/PageHead';
import { usePage } from '@inertiajs/react';
import DashboardLayout from "./DashboardLayout";
import PostForm from "./PostForm";

function NewPost()
{
    const { props } = usePage();
    const user = props?.auth?.user;

    return ( 
    <DashboardLayout 
        currentTab="post" 
        headerText="new post"
    >
            <PageHead title="New Post" />
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