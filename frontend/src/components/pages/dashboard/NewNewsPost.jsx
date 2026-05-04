import { useAuth } from "../../../contexts/AuthContext";
import DashboardLayout from "./DashboardLayout";
import PostForm from "./PostForm";
import { Category } from "../../../utils/helpers";

function NewNewsPost()
{
    const { user } = useAuth();

    return ( 
    <DashboardLayout currentTab="post" headerText="new post">
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