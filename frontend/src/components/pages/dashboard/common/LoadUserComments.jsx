import { useAuth } from "../../../../contexts/AuthContext";
import { useEffect, useState } from "react";
import Comment from "../../../common/Comment";
const COMMENT_FETCH_LIMIT = 3;

function LoadUserComments({isFullPage=false, classes=""})
{
    const { fetchUserComments, user } = useAuth();
    const [comments, setComments] = useState(null);

    useEffect(() =>
    {
        if(!user)
        {
            return;
        }
        fetchUserComments(isFullPage ? null : COMMENT_FETCH_LIMIT)
        .then((data) => 
        { 
            setComments(data.comments);
        })
        .catch((err) =>
        {
            console.error(err);
            setComments([]);
        })
    },[user, fetchUserComments, setComments, isFullPage])

    return (
     <div className={"comments-container " + classes}>
        {
            comments ? comments.map((comment, i) =>
            {
                let parentElement = comments.findIndex(c => c.id === comment.parent_id);
                parentElement = parentElement === -1 ? null : parentElement; 
                return <Comment 
                            comment={comment} 
                            key={i} 
                            id={i}
                            isDashboard={true}
                        />
            }):
            (
                comments?.length === 0 ? (
                    <p>no comments</p>
                ):(
                    <p>loading comments...</p>
                )
            )
        }
     </div>   
    )
}
export default LoadUserComments;