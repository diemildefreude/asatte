import { Link, router, usePage } from '@inertiajs/react';
import CheckboxField from "./CheckboxField";

function UserAgreement({onAgreeChange, onHumanChange, onRobotChange, 
    agreeVal, humanVal, robotVal, isSubmitting}) 
{
    const { props } = usePage();
    const APP_NAME = props.app_name;
    const AGREEMENT_VERSION = props.app_user_agreement_version;
    return (<>
    <div className="user-agreement article-text">
        <div className="centered-content vert-1rem">
            <h2>user agreement</h2>
        </div>
        <div className="footnote bottom-1rem">version {AGREEMENT_VERSION}</div>
        <p>As a member of {APP_NAME}, you agree to only post content qualifying as Internet Art. As outlined in the <Link href="/about">about</Link> section, this is any work that requires the Internet for its realization. Furthermore, all posted work should be primarily artistic in nature. Eg. a work can contain nudity but should distinguish itself clearly from pornography in its concept and realization. Likewise, any post whose primary goal is to promote a business or make money is not acceptable. In any and all cases, it is at the final discretion of the webmaster and administrators to temporarily hide or delete any content or user found to not abide by these principles.</p>

        <p>Users whose content has been temporarily hidden will be notified so that they can make changes or appeal the decision.</p>

        <p>Users must have the right to archive the work they post. {APP_NAME} complies with DMCA takedown requests and will remove infringing material upon valid notice.</p>

        <p>{APP_NAME} will not leak your personal information to anyone or use it for anything but your {APP_NAME} account.</p>

        <p>Without receiving your explicit agreement, {APP_NAME} will not use images and information from your posts for anything but the following :</p>

        <ol>
            <li>The posts themselves on the website</li>
            <li>Images of posts may appear in screenshots of the {APP_NAME} without explicit credit.</li>
            <li>For any promotional content that explicitly highlights the work of a {APP_NAME} user, credit will be given.</li>
        </ol>

        <p>{APP_NAME} is not responsible for any user-generated content that violates our terms or is otherwise perceived as offensive. Once discovered, we will hide or delete such content as we see fit.</p>

        <p>Users posting their own work are the copyright-holders thereof and {APP_NAME} makes no claim thereto.</p>
        </div>
        <CheckboxField name="user-agree"
            label="I am a robot"
            value={robotVal}
            onChange={onRobotChange}
            disabled={isSubmitting}
        />    
        <CheckboxField name="user-human"
            label="I am a human"
            value={humanVal}
            onChange={onHumanChange}
            disabled={isSubmitting}
            classes="bonus"
        />    
        <CheckboxField name="user-agree"
            label="I agree to the above terms."
            value={agreeVal}
            onChange={onAgreeChange}
            disabled={isSubmitting}
        />
    </>);
}

export default UserAgreement;