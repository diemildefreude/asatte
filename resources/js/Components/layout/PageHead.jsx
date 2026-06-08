import { Head, usePage } from '@inertiajs/react';

function PageHead({
    title="", 
    description="The premiere hub for internet art.",
    ogType="website",
    ogImg
    })
{
    const { url } = usePage();
    const fullUrl = `${usePage().props.app_url}${url}`; 
    const domain = usePage().props.app_url;
    const ogImage = ogImg ?? `${domain}/storage/images/og_image.webp`;

    return(
        <Head title={title}>
            <meta head-key="description" name="description" content={description} />
            
            {/* Open Graph / Facebook / LinkedIn / Discord */}
            <meta head-key="og:url" property="og:url" content={fullUrl} />
            <meta head-key="og:type" property="og:type" content={ogType} />
            <meta head-key="og:title" property="og:title" content={title || "asatte.io"} />
            <meta head-key="og:description" property="og:description" content={description} />
            <meta head-key="og:image" property="og:image" content={ogImage} />
            <meta head-key="og:image:width" property="og:image:width" content="1920" />
            <meta head-key="og:image:height" property="og:image:height" content="1080" />
            {/* Twitter */}
            <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta head-key="twitter:domain" property="twitter:domain" content={domain} />
            <meta head-key="twitter:url" property="twitter:url" content={fullUrl} />
            <meta head-key="twitter:title" name="twitter:title" content={title || "asatte.io"} />
            <meta head-key="twitter:description" name="twitter:description" content={description} />
            <meta head-key="twitter:image" name="twitter:image" content={ogImage} />
        
        </Head>
    )
}

export default PageHead;