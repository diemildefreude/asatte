import { Head } from '@inertiajs/react';
import Layout
 from '../Components/layout/Layout';
function NotFound()
{
    return(
        <>
            <Head title="Not Found" />
            <p className="centered-content top-offset">
                Page not found. Check your spelling.
            </p>
        </>
    )
}


NotFound.layout = page => <Layout>{page}</Layout>;
export default NotFound;