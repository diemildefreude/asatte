import { Link } from "react-router-dom";

function HiddenPostNotice({classes, isAdmin=false})
{
    const classNames = "red-gradient-background main-info-box centered-content " + classes; 
    return(
        <div className={classNames}>
            <h3>Post has been hidden by an admin.</h3>
            {
                !isAdmin && (
                    <p>To contest this, please reply to the message in your <Link to="/dashboard/mail">mailbox</Link> or use the <Link to="/contact">contact form</Link>.</p>
                )
            }            
        </div>
    );
}

export default HiddenPostNotice;