import DashboardLayout from "./DashboardLayout"
import PostForm from "./PostForm"
import { useEffect, useState } from "react";
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';
import HiddenPostNotice from '../../Components/common/HiddenPostNotice';
import { getErrorMessage } from '../../utils/helpers';

    function EditPost({ post: initialPost })
    {
        const { props } = usePage();
        const user = props?.auth?.user;
        const [post, setPost] = useState(initialPost);

    return (
    <DashboardLayout
        currentTab=""
        headerText="edit post"
    >
            <PageHead title="Edit Post" />
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