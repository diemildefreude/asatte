import React from "react";
import { getDateAsYYYYMMDD } from "../../../utils/helpers";
import { Link, router, usePage } from '@inertiajs/react';

function ConversationPreview({conversation})
{

    const { props } = usePage();
    const otherUser = conversation.other_users[0];
    const avatar = otherUser?.avatar ? `${props.app_url}/storage/images/uploaded/users/${otherUser.username}/avatar/small/${otherUser?.avatar}` 
        : `${props.app_url}/images/defaults/avatar.webp`;
    const avatarAlt = otherUser?.username ? `${otherUser.username}'s avatar` : "Deleted user. Showing default avatar.";
    const latestSenderName = conversation.latest_message.sender ? conversation.latest_message.sender.username : "[deleted user]";
    const usersString = conversation.users
        .map(user => user.username)
        .join(', ');

    const convoLink = `/dashboard/mail/${conversation.id}`;

    let avatarClasses = "convo-avatar";
    avatarClasses += conversation.is_unread ? " has-new-mail" : "";

    return (
        conversation ? (
        <Link href={convoLink} 
            className={"convo-preview"}>
            <div className="convo-avatar-key-info">
                <div className={avatarClasses}>
                    <img className = "round-image" src={avatar} alt={avatarAlt} />
                    <div className="notice-light"></div>
                </div>
                <div className="convo-key-info">
                    <div className="convo-title"
                        dangerouslySetInnerHTML={{ __html: conversation.name }}
                    />
                    <div className="other-users subtext">{`${usersString}・${getDateAsYYYYMMDD(conversation.created_at)}`}</div>
                </div>
            </div>
            <div className="convo-latest-info">
                <div className="convo-latest-date">{getDateAsYYYYMMDD(conversation.latest_message.created_at)}</div>
                <div className="convo-latest-sender subtext">{latestSenderName}</div>
            </div>
        </Link>):(<p>loading...</p>)
    );
}

export default ConversationPreview;