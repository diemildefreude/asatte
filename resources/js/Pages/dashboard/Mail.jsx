import DashboardLayout from "./DashboardLayout";

import "../DashboardProfile.css";
import "./TagsMail.css";
import { useCallback, useEffect, useRef, useState } from "react";
import PageHead from '../../Components/layout/PageHead';
import { Link, router, usePage } from '@inertiajs/react';
import { getErrorMessage } from '../../utils/helpers';
import LoadItems from '../../Components/common/LoadItems';
import ConversationPreview from "./common/ConversationPreview";
import DashboardCreateHeader from "./common/DashboardCreateHeader";
const FETCH_AMOUNT = 10;

function Mail()
{
    const { props } = usePage();
    const user = props.auth?.user;
    const { conversations } = props;


    return ( 
    <DashboardLayout currentTab="mail">
            <PageHead title="Mail" />

        {                
            user && user.is_email_verified ?
            (<>
                <DashboardCreateHeader
                    headerText="mailbox"
                    createLink="/dashboard/mail/new"
                />
                <LoadItems
                    partialProp="conversations"
                    initialItems={conversations}
                    renderMethod={(item) =>({
                        conversation: item
                    })}
                    Component={ConversationPreview}
                    itemString="conversations"
                    isFullPage={true}
                    classes=""
                />
            </>)
            :(<p className="centered-content padding-1rem">
                    Please verify your e-mail to begin mailing other users.
            </p>)
        }
    </DashboardLayout>
    );
}
export default Mail;