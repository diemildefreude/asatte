import { Head } from '@inertiajs/react';
import Layout
 from '../Components/layout/Layout';
function NotFound()
{
    return(
        <Layout>
            <Head title="Not Found" />
            <p className="centered-content top-offset">
                Page not found. Check your spelling.
            </p>
        </Layout>
    )
}

export default NotFound;