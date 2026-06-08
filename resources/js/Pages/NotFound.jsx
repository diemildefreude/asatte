import PageHead from '../Components/layout/PageHead';
import Layout
 from '../Components/layout/Layout';
function NotFound()
{
    return(
        <>
            <PageHead title="Not Found" />
            <p className="centered-content top-offset">
                Page not found. Check your spelling.
            </p>
        </>
    )
}


NotFound.layout = page => <Layout>{page}</Layout>;
export default NotFound;