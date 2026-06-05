import { Head, usePage } from '@inertiajs/react';

import DashboardLayout from "./DashboardLayout";
import PostForm from "./PostForm";
import { Category } from '../../utils/helpers';

function NewNewsPost()
{
    const { props } = usePage();
    const user = props.auth?.user;

    return ( 
    <DashboardLayout currentTab="post" headerText="new post">
            <Head title="New News Post" />
        {
            user && user.is_email_verified ?
            (
                <PostForm
                    isCreateForm={true}
                    category={Category.News}
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
export default NewNewsPost;