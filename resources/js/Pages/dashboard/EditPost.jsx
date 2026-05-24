import DashboardLayout from "./DashboardLayout"
import PostForm from "./PostForm"
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from "react";
import {  Link, router, usePage , Head } from '@inertiajs/react';
import HiddenPostNotice from '../../Components/common/HiddenPostNotice';
import { getErrorMessage } from '../../utils/helpers';

    function EditPost({ post: initialPost })
    {
        
        const { user } = useAuth();
        const [post, setPost] = useState(initialPost);

    return (
    <DashboardLayout
        currentTab=""
        headerText="edit post"
    >
            <Head title="Edit Post" />
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