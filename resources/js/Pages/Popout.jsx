import { useState, useEffect } from "react";
import WebsiteIframe from "../Components/common/WebsiteIframe";
import PageHead from "../Components/layout/PageHead";
import { usePage } from "@inertiajs/react";
import "./Popout.css";

function Popup({post})
{
    const { props } = usePage();
    console.log("post");
    const [isStarted, setIsStarted] = useState(false);
    const author = post.user;
    const directory = `${props.app_url}/storage/images/uploaded/users/${author.username}/posts/${post.slug}/gallery/large`
    const mainImage = `${directory}/${post.gallery_image_urls[0]}`;
    const mainAlt = post.gallery_alts[0];

    return(
    <>
        <PageHead title={post.title}/>
        {
            isStarted ? (
            <WebsiteIframe 
                url={post.website}
                isPopout={true}
            />):(
            <div className="popout-start-screen">
                <img 
                    src={mainImage}
                    alt={mainAlt}
                />
                <div className="image-panel"></div>
                <button onClick={()=>setIsStarted(true)}>enter: <em>{post.title}</em></button>
            </div>)
        }        
    </>);
}
Popup.layout = (page) => page;
export default Popup;