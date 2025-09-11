import Layout
 from "../layout/Layout";
function NotFound()
{
    return(
        <Layout>
            <p className="centered-content top-offset">
                Page not found. Check your spelling.
            </p>
        </Layout>
    )
}

export default NotFound;