import { Link, router, usePage } from '@inertiajs/react';

function HiddenPostNotice({classes, isAdmin=false})
{
    const classNames = "red-gradient-background main-info-box centered-content " + classes; 
    return(
        <div className={classNames}>
            <h3>Post has been hidden by an admin.</h3>
            {
                !isAdmin && (
                    <p>To contest this, please reply to the message in your <Link href="/dashboard/mail">mailbox</Link> or use the <Link href="/contact">contact form</Link>.</p>
                )
            }            
        </div>
    );
}

export default HiddenPostNotice;