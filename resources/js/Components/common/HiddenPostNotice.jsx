import { Link, router, usePage } from '@inertiajs/react';

function HiddenPostNotice({classes, isAdmin=false})
{
    const classNames = "red-gradient-background main-info-box centered-content " + classes; 
    const notice = isAdmin ? "Post has been hidden by a webmaster." : "Post has been hidden by an admin.";
    return(
        <div className={classNames}>
            <h3>{notice}</h3>
            <p>To contest this, please reply to the message in your <Link href="/dashboard/mail">mailbox.</Link></p>             
        </div>
    );
}

export default HiddenPostNotice;