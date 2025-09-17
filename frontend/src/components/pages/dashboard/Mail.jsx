import Layout from "../../layout/Layout";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../../../contexts/AuthContext";
import "../DashboardProfile.css";

function Mail()
{
    const { user } = useAuth();

    return ( 
    <Layout>
        <DashboardLayout currentTab="mail" headerText="mailbox">
            {
                user && user.is_email_verified ?
                (
                    <></>
                ):
                (
                    <p className="centered-content padding-1rem">
                        Verify your e-mail to begin mailing other users.
                    </p>
                )
            }
        </DashboardLayout>
    </Layout>
    );
}
export default Mail;