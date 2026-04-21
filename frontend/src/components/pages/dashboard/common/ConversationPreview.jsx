import React from "react";
import { getDateAsYYYYMMDD } from "../../../../utils/helpers";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ConversationPreview({conversation})
{
    //console.log("This is a preview:", conversation);
    const otherUser = conversation.other_users[0];
    const avatar = otherUser?.avatar ? `${BACKEND_URL}/storage/images/uploaded/users/${otherUser.username}/avatar/small/${otherUser?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;
    const usersString = conversation.users
        .map(user => user.username)
        .join(', ');

    const convoLink = `/dashboard/mail/${conversation.id}`;

    let avatarClasses = "convo-avatar";
    avatarClasses += conversation.is_unread ? " has-new-mail" : "";

    //console.log("conversation.is_unread", conversation.is_unread);

    return (
        <Link
            to={convoLink} 
            className={"convo-preview"}>
            <div className="convo-avatar-key-info">
                <div className={avatarClasses}>
                    <img className = "round-image" src={avatar} alt={`${conversation.other_users[0].username}'s avatar`} />
                    <div className="notice-light"></div>
                </div>
                <div className="convo-key-info">
                    <div className="convo-title">{conversation.name}</div>
                    <div className="other-users subtext">{`${usersString}・${getDateAsYYYYMMDD(conversation.created_at)}`}</div>
                </div>
            </div>
            <div className="convo-latest-info">
                <div className="convo-latest-date">{getDateAsYYYYMMDD(conversation.latest_message_at)}</div>
                <div className="convo-latest-sender subtext">{conversation.latest_message.sender.username}</div>
            </div>
        </Link>
    );
}

export default ConversationPreview;