import DOMPurify from 'dompurify';
const SAFE_VIDEO_IFRAME_HOSTS = [
  /^(?:www\.)?youtube\.com$/i,
  /^(?:www\.)?youtube-nocookie\.com$/i,
  /^player\.vimeo\.com$/i,
  /^(?:www\.)?vimeo\.com$/i,
  /^(?:www\.)?dailymotion\.com$/i,
  /^geo\.dailymotion\.com$/i,
  /^(?:www\.)?youku\.com$/i,
  /^player\.youku\.com$/i,
  /^v\.youku\.com$/i,
];

function isSafeVideoIframeSrc(src) 
{
  try 
  {
    const url = new URL(src, window.location.origin);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return SAFE_VIDEO_IFRAME_HOSTS.some((re) => re.test(url.hostname));
  } 
  catch 
  {
    return false;
  }
}

export function sanitizeRichHtml(html) 
{
  if (!html) return '';

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const src = node.getAttribute('src') || '';
      if (!isSafeVideoIframeSrc(src)) {
        node.parentNode?.removeChild(node);
      }
    }
  });

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
      'blockquote', 'ul', 'ol', 'li', 'a', 'img',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div',
      'iframe',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height',
      'style', 'class', 'frameborder', 'allowfullscreen', 'allow',
      'referrerpolicy',
    ],
    ALLOW_DATA_ATTR: false,
  });

  DOMPurify.removeHook('uponSanitizeElement');
  return clean;
}

export function addFetchedPostsToExcludes(posts, previous)
{
    console.log("afpte: posts, previous", posts, previous);
    const excludes = previous;
    posts.forEach((post) =>
    {
        //console.log("post?", post);
        excludes.push(post.id); 
    })
    return excludes;
}
export function getPostsFetchParams(amount, category, fetchOrder, 
    fetchIndexRef=null, fetchExcludesRef=null, userId=null, username=null, searchTerm="")
{
    const params = new URLSearchParams();     
    params.append('amount', amount);
    params.append('fetch_order', fetchOrder); 
    params.append('category', category);
    params.append('search_term', searchTerm);

    if(fetchOrder == FetchOrder.Random)
    {
        params.append('excludes', fetchExcludesRef.current);
    }
    else if(fetchIndexRef.current)
    {
        params.append('start_id', fetchIndexRef.current);
    } 

    if(userId) 
    {
        params.append('user_id', userId);
    }    
    else if(username)
    {
        params.append('username', username);
    }    
    return params;
}

export function scrollToElement (currentUrl, id, replaceState=true)
{
    const newUrl = `${currentUrl}#${id}`;
    if(replaceState)
    {
        window.history.replaceState(null, "", newUrl); // updates URL hash without reloading
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export function getDateAsYYYYMMDD(dateTimeString)
{
    const dateObj = new Date(dateTimeString);

    const offsetDate = new Intl.DateTimeFormat('en-CA', { // 'en-CA' uses YYYY-MM-DD format!
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        }).format(dateObj);  

    return offsetDate
}
export function getTimeAsHHMM(dateTimeString)
{
    const dateObj = new Date(dateTimeString);

    // toLocaleTimeString respects the user's local time zone automatically
    const timeString = new Intl.DateTimeFormat('en-CA', {
        hour: '2-digit',
        minute: '2-digit',
        //hour12: false // 24-hour (military) format
    }).format(dateObj); 
    
    return timeString.replace(' AM', 'am').replace(' PM', 'pm');
}
function blobToBase64(blob) 
{
    return new Promise((resolve, reject) => 
    {
        const reader = new FileReader();
        reader.onloadend = () => 
        {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
function handleResizeWithCanvas(img, mimeType)
{
    return new Promise((resolve) => 
    {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 1280;
        const maxHeight = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) 
        {
            if (width > maxWidth) 
            {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } 
        else 
        {
            if (height > maxHeight) 
            {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }            
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => 
        {
            resolve(blob);
        }, mimeType, 0.7);
    });    
}
export function resizeImage(source)
{
    if (typeof source === 'string')
    {
        return new Promise((resolve, reject) => 
        {
            const img = new Image();
            img.onload = async () => 
            {
                try 
                {
                    const blob = await handleResizeWithCanvas(img, 'image/jpeg');
                    resolve(blob);
                } 
                catch (error) 
                {
                    reject(error);
                }
            };
            img.onerror = reject;
            img.src = source;
        });
    }
    else if (source instanceof File || source instanceof Blob) 
    {
        if (!source.type.match('^image/')) 
        {
            return Promise.reject('Invalid file type. Not an image.');
        }
        return new Promise((resolve, reject) => 
        {
            const reader = new FileReader();
            reader.onload = async (e) => 
            {
                const img = new Image();
                img.onload = async () => 
                {
                    try 
                    {
                        const blob = await handleResizeWithCanvas(img, source.type);
                        resolve(blob);
                    } 
                    catch (error) 
                    {
                        reject(error);
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(source);
        });
    } 
    else 
    {
        return Promise.reject('Invalid source. Must be a File, Blob, or Blob URL.');
    }
}

// export async function processQuillImages(deltaOps) 
// {
//     const processedOps = [];
//     const imagePromises = [];

//     // First, identify all images and start the async processing
//     for (const op of deltaOps) 
//     {
//         if (op.insert && typeof op.insert.image === 'string') 
//         {
//             const imageUrl = op.insert.image;
//             if (imageUrl.startsWith('data:image/')) //is a new image blob
//             {
//                 const imagePromise = resizeImage(imageUrl)
//                     .then(blob => 
//                     {
//                         return { type: 'blob', data: blob };
//                     })
//                     .catch(error => 
//                     {
//                         console.error('Error resizing image:', error);
//                         return { type: 'error', data: imageUrl };
//                     });
//                 imagePromises.push(imagePromise);
//                 processedOps.push({ ...op, insert: { image: 'IMAGE_PLACEHOLDER_' + (imagePromises.length - 1) } });
//             } 
//             else 
//             {
//                 // It's an existing URL, just keep it as is.
//                 processedOps.push(op);
//             }
//         } else {
//             // Not an image, just add it to the new array.
//             processedOps.push(op);
//         }
//     }

//     // Await all image resizing promises
//     const processedImages = await Promise.all(imagePromises);

//     // Replace the placeholders with the actual processed image data
//     for (let i = 0; i < processedOps.length; i++) 
//     {
//         const op = processedOps[i];
//         if (op.insert && typeof op.insert.image === 'string' && op.insert.image.startsWith('IMAGE_PLACEHOLDER_')) 
//         {
//             const index = parseInt(op.insert.image.split('_')[2], 10);
//             const imageData = processedImages[index];
//             if (imageData.type === 'blob') 
//             {
//                 op.insert.image = await blobToBase64(imageData.data);
//             } 
//             else if (imageData.type === 'error') 
//             {
//                 op.insert.image = imageData.data; // Keep original URL
//             }
//         }
//     }

//     console.log(deltaOps, "processing to:", processedOps);

//     return processedOps;
// }
export function dehydrateEditorImagePaths(htmlString, appUrl = '') 
{
    const BACKEND = appUrl ? appUrl.replace(/\/$/, '') : '';
    const STORAGE_BASE_URL = BACKEND ? `${BACKEND}/storage` : '/storage';
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const images = doc.querySelectorAll('img');

    for (const img of images) {
        const currentSrc = img.getAttribute('src') || '';

        // Try to match any variant of storage paths and normalize to "images/..." without leading slash
        // Matches: http(s)://.../storage/images/..., /storage/images/..., storage/images/...
        const m1 = currentSrc.match(/(?:https?:\/\/[^\/]+)?\/?storage\/(images\/uploaded\/.+)/i);
        if (m1 && m1[1]) {
            img.setAttribute('src', m1[1]);
            continue;
        }
        const m2 = currentSrc.match(/^storage\/(images\/uploaded\/.+)/i);
        if (m2 && m2[1]) {
            img.setAttribute('src', m2[1]);
            continue;
        }
        // If it starts with the configured backend + /storage, strip that portion
        if (BACKEND && currentSrc.startsWith(`${BACKEND}/storage`)) {
            const relativePath = currentSrc.replace(`${BACKEND}/storage`, '').replace(/^\/+/, '');
            img.setAttribute('src', relativePath);
            continue;
        }
    }
    return doc.body.innerHTML;
}
export function hydrateEditorImagePaths(htmlString, appUrl = '')
{
    const BACKEND = appUrl ? appUrl.replace(/\/$/, '') : '';
    const STORAGE_BASE_URL = BACKEND ? `${BACKEND}/storage` : '/storage';
    const parser = new DOMParser();
    // Parse the string into a temporary DOM tree
    const doc = parser.parseFromString(htmlString, 'text/html');
    const images = doc.querySelectorAll('img');

    for (const img of images)
    {
        const rawPath = img.getAttribute('src');

        // SKIP if: no src, starts with http, starts with www, or is a base64 blob
        if (!rawPath || 
            rawPath.startsWith('http') || 
            rawPath.startsWith('www') || 
            rawPath.startsWith('data:')) {
            continue; 
        }
        // Normalize several possible incoming formats into a clean "images/..." path
        let cleanPath = null;
        const m1 = rawPath.match(/(?:https?:\/\/[^\/]+)?\/?storage\/(images\/uploaded\/.+)/i);
        if (m1 && m1[1]) {
            cleanPath = m1[1];
        } else if (/^storage\/(images\/uploaded\/.+)/i.test(rawPath)) {
            cleanPath = rawPath.replace(/^storage\//i, '');
        } else if (/^images\/uploaded\/.+/i.test(rawPath)) {
            cleanPath = rawPath;
        }
        if (!cleanPath) continue;
        const absoluteUrl = `${STORAGE_BASE_URL}/${cleanPath.replace(/^[\/]+/, '')}`;
        img.src = absoluteUrl;
        //console.log("clean path?", rawPath, cleanPath, absoluteUrl)
    }
    return doc.body.innerHTML;
}
export async function processEditorImages(htmlString) 
{
    const parser = new DOMParser();
    // Parse the string into a temporary DOM tree
    const doc = parser.parseFromString(htmlString, 'text/html');
    const images = doc.querySelectorAll('img');

    for (const img of images) 
    {
        if (img.src.startsWith('data:image/')) //is a new image blob
        {
            const response = await fetch(img.src);
            const blob = await response.blob();
            
            // 2. Your existing Canvas Resizing logic
            const resizedBlob = await resizeImage(blob);
            
            // 3. Update the attribute in our "virtual" document
            img.src = await blobToBase64(resizedBlob);
        } 
    }
    return doc.body.innerHTML;
}

function isValidImageType(file)
{
    if(!file)
    {
        return false;
    }
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/bmp'
    ];
    const isValidImageType = allowedMimeTypes.includes(file.type);
    return isValidImageType;
}
export function getImageFilesFromInput(e)
{
    let inputs = e.dataTransfer ? e.dataTransfer.items : e.target.files;
    const outputs = [];
    let error = '';
    for(let i = 0; i < inputs.length; ++i)
    {
        const file = e.dataTransfer ? inputs[i].getAsFile() : inputs[i];
        const isValid = isValidImageType(file);
        if(!isValid)
        {
            error = "Files must be images of type jpg, png, webp or bmp."
            continue;
        }
        outputs.push(file);
    }
    return { images: outputs, error: error };
}
export function getImageFileFromInput(e) //handles Drop too
{
    const file = e.dataTransfer ? e.dataTransfer.items[0].getAsFile() : e.target.files[0];
    const isValid = isValidImageType(file);

    //console.log("info", file.type, isValidImageType);
    if(!isValid)
    {        
        return null;
    }
    return file;
}
export function getImageUrlFromFile(file)
{
    return new Promise ((resolve) =>
    {
        const reader = new FileReader();
        reader.onload = (e) => 
        {
            const imageDataUrl = e.target.result;
            resolve(imageDataUrl);
        };   
        //const f = file.kind === 'file' ? file.getAsFile() : file; //getAsFile required for drop
        reader.readAsDataURL(file);
    })    
}

export function addImageDragListeners(element, counterRef, handleDrop)
{
    if(!element)
    {
        return;
    }

    function handleDragOver (e)
    {
        e.preventDefault();
        e.stopPropagation();
    };
    function handleDragEnter(e)
    {
        e.preventDefault();
        e.stopPropagation();
        counterRef.current++;
        if (counterRef.current === 1) 
        {
            element.classList.add('dragged-over');
        }
    }
    function handleDragLeave (e)
    {
        e.preventDefault();
        e.stopPropagation();
        counterRef.current--;
        if (counterRef.current === 0) 
        {
            element.classList.remove('dragged-over');
        }
    };
    
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);

    return() =>
    {
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('dragenter', handleDragEnter);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('drop', handleDrop);
    };        
}

export function getVideoEmbedUrl(url)
{
    const youTubePatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/, // youtube.com/watch?v=VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, // youtube.com/embed/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/, // youtube.com/embed/VIDEO_ID
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/, // youtube.com/v/VIDEO_ID (older embed)
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/ // youtube.com/shorts/VIDEO_ID
    ];
    const vimeoPatterns = [
        /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d{8,11})/, // Standard URL: https://vimeo.com/123456789
        /(?:https?:\/\/)?(?:www\.)?player\.vimeo\.com\/video\/(\d{8,11})/ // Embed URL: https://player.vimeo.com/video/123456789
    ];
    const dailyMotionPatterns = [
        /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]{1,18})/, // Standard URL: https://dailymotion.com/video/x123abc
        /(?:https?:\/\/)?(?:www\.)?dai\.ly\/([a-zA-Z0-9]{1,18})/ // Shortened URL: https://dai.ly/x123abc
    ];
    const youkuPatterns = [
        /(?:https?:\/\/)?(?:www\.)?youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/, // Common URL format
        /(?:https?:\/\/)?(?:v\.youku\.com\/v_show\/id_)?([a-zA-Z0-9=]+)\.html/ // Another common URL format
    ];

    let videoId = getVideoId(url, youTubePatterns);
    if (videoId) 
    {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    videoId = getVideoId(url, vimeoPatterns);
    if (videoId) 
    {
        return `https://player.vimeo.com/video/${videoId}`;
    }

    videoId = getVideoId(url, dailyMotionPatterns);
    console.log("dailyMotion?!", videoId);
    if (videoId) 
    {
        return `https://www.dailymotion.com/embed/video/${videoId}`;//?autoplay=false`;
    }

    videoId = getVideoId(url, youkuPatterns);
    if (videoId) 
    {
        return `https://player.youku.com/embed/${videoId}`;
    }
    
    return "";
}

export function getVideoId(url, patterns) 
{
    if (!url || typeof url !== 'string') 
    {
        return null; // Handle null, undefined, or non-string inputs
    }

    let videoId = null;

    for (const pattern of patterns) 
    {
        const match = url.match(pattern);
        if (match && match[1]) {
            videoId = match[1];
            break; // Found a match, no need to check other patterns
        }
    }
    
    return videoId;
}
export function getImageUrlsFromDelta(ops) 
{
    if (!Array.isArray(ops)) 
    {
        return [];
    }

    const imageUrls = ops.filter(op =>
        typeof op.insert === 'object' && op.insert !== null && op.insert.image
    ).map(op => op.insert.image);

    return imageUrls;
}

export function getErrorMessage(err)
{
    console.log("err?", err);
    let displayErrorMessage = "An unexpected error occurred. Please try again.";
    if (err.response && err.response.data) 
    {
        const apiResponseData = err.response.data;

        // Prioritize the general 'message' from the API response
        if (apiResponseData.message) 
        {
            displayErrorMessage = apiResponseData.message;
        }
        if (apiResponseData.errors) 
        {
            let concatenatedErrors = '';
            for (const key in apiResponseData.errors) 
            {
                // Concatenate only the first message for each field, or all if preferred
                concatenatedErrors += apiResponseData.errors[key][0] + ' ';
            }
            displayErrorMessage += " | " + concatenatedErrors.trim();
        }
        else if (err.response.data.error)
        {
            displayErrorMessage = err.response.data.error;
        }
    }
    return displayErrorMessage;
}
export function isUrl(string)
{
    try 
    {
        const fullUrl = string.includes('://') ? string : `http://${string}`;
        new URL(fullUrl);
        return true;
    } 
    catch (err) 
    {
        return false;
    }
}
export function isAlphaDash(str) 
{
  // Use the test() method of the regular expression
  return /^[a-zA-Z0-9_-]+$/.test(str);
}

export function isValidPassword(passwordString) 
{
  // Ensure the input is a string
    if (typeof passwordString !== 'string') 
    {
        return false;
    }

    // 1. Minimum length check
    const minLength = 8;
    if (passwordString.length < minLength) 
        {
        return false;
    }

    // 2. Character type checks using individual regex patterns
    const hasLowercase = /[a-z]/.test(passwordString);
    const hasUppercase = /[A-Z]/.test(passwordString);
    const hasDigit = /[0-9]/.test(passwordString);
    // Matches commonly used special characters. You can customize this set.
    //const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` ]/.test(passwordString); // Added space as special char

    // Combine conditions: at least one of each type required
    const meetsCharacterDiversity = hasLowercase && hasUppercase && hasDigit;// && hasSpecialChar;

    return meetsCharacterDiversity;
}

export function isValidEmail(emailString) 
{
  // Ensure the input is a string
  if (typeof emailString !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailString);
}
export function getDateString(date = new Date()) 
{
  const year = date.getFullYear();

  // getMonth() returns 0-11, so add 1 for the actual month number (1-12)
  // .padStart(2, '0') ensures that single-digit months (1-9) get a leading zero (e.g., "01", "06")
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // getDate() returns the day of the month (1-31)
  // .padStart(2, '0') ensures single-digit days get a leading zero (e.g., "01", "09")
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // Combines them into "YYYY-MM-DD" format
}

export function openPopup(url, windowName, left, top, width, height)
{
    //console.log(top, left, width, height);
    const features = `width=${width},height=${height},left=${left},top=${top},
                      resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no,location=no`;
    return window.open(url, windowName, features);
}

export const MemberType = 
{
    Standard: 'standard',
    Pro: 'pro',
    Admin: 'admin',
    Webmaster: 'web_master'
}
export const ScreenSize = 
{
    Nothing: 0,
    Narrow: 1, 
    Small: 2,
    Mid: 3,
    Wide: 4,
}

export const Category =
{
    News: 'news',
    Archive: 'archive'
}

export const FetchOrder =
{
    Ascending: 'ascending',
    Descending: 'descending',
    Random: 'random'
}

export const NotificationType =
{
    Comment: 'comment',
    Reply: 'reply',
    Follower: 'follower',
    Unhidden: 'unhidden'
}

export const HistoryEntryType =
{
    Push: 'push',
    Replace: 'replace',
    Nothing: 'nothing'
}
export function getNextFetchIndex(fetchedPosts, fetchOrder) 
{    
    const post = fetchedPosts[fetchedPosts.length - 1];
    const id = post.pivot_id ?? post.id;
    //console.log(post, id);
    if(fetchOrder === FetchOrder.Ascending)
    {
        return id + 1;
    }
    if(fetchOrder === FetchOrder.Descending)
    {
        //console.log(`setting fetchIndex: ${id - 1}`);
        return id - 1;
    }
    if(fetchOrder === FetchOrder.Random)
    {
        //do this later
    }
}
export function getScreenSize()
{    
    const NARROW_SCREEN_BREAKPOINT = 1;
    const SMALL_SCREEN_BREAKPOINT = 600;
    const MID_SCREEN_BREAKPOINT = 950;
    const WIDE_SCREEN_BREAKPOINT = 1200;

    let screenSize;

    if(window.innerWidth >= WIDE_SCREEN_BREAKPOINT)
    {
        screenSize = ScreenSize.Wide;
    }
    else if(window.innerWidth >= MID_SCREEN_BREAKPOINT)
    {
        screenSize = ScreenSize.Mid;
    }
    else if(window.innerWidth >= SMALL_SCREEN_BREAKPOINT)
    {
        screenSize = ScreenSize.Small;
    }
    else if(window.innerWidth >= NARROW_SCREEN_BREAKPOINT)
    {
        screenSize = ScreenSize.Narrow;
    }
    else
    {
        screenSize = ScreenSize.Nothing;
    }
    return screenSize;        
}

export function monitorScreenSize(setScreenSize, delay = 500)
{
    const intervalId = setInterval(() =>
    {
        const currentSize = getScreenSize();
        setScreenSize(prev => (prev !== currentSize ? currentSize : prev));
    }, delay);
    return () => clearInterval(intervalId);
}

export function checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSize)
{
    const prevScreenSize = prevScreenSizeRef.current;
    let shouldFetch = screenSize > prevScreenSize && screenSize > fetchedScreenSize.current;
    // if (shouldFetch) 
    // {
    //     console.log("Viewport transitioned from narrow to wide, fetching more posts.");
    // }

    // Update the ref for the next render's comparison
    prevScreenSizeRef.current = screenSize;
    return shouldFetch;
}

// export const fetchPosts = async (params) =>
// {
//     return new Promise ((resolve, reject) =>
//     {
//         fetch(`${BACKEND_URL}/api/posts?${params.toString()}`)
//         .then(response => 
//         {            
//             if (!response.ok) 
//             {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => 
//         {
//             resolve(data);
//         })
//         .catch(error => 
//         {
//             console.error("Error fetching posts");
//             reject();
//         });
//     })
// };

export const handleSubmit = async (e, uri, data) =>
{
    return new Promise ((resolve, reject) =>
    {
        fetch(uri, 
        {
            method: 'POST', // Or 'POST', 'PUT', 'DELETE', etc., depending on your controller action
            //mode: 'cors',
            headers: {
                'Content-Type': 'application/json', // If you're sending JSON data
                // You might need other headers like 'Authorization' for authentication
            },
            body: data 
        })
        .then(response => 
        {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Or response.text() if your backend returns plain text
        })
        .then(data => 
        {
            resolve(data);
        })
        .catch(error => 
        {
            console.error('There was an error fetching data:', error);
            reject(error);
        });
    });
}

/**
 * A generic function to retry a promise-based operation.
 * @param {function} fn - The function to retry (should return a Promise).
 * @param {number} retries - The number of retry attempts.
 * @param {number} delay - The delay in milliseconds between retries.
 * @param {string} errorMessage - A message to display if all retries fail.
 * @returns {Promise<any>} A promise that resolves with the result of fn, or rejects if all retries fail.
 */
export const retryOperation = async (fn, retries = 3, delay = 1000, errorMessage = 'Operation failed after multiple retries.') => 
{
    let attempts = 0;
    while (attempts < retries) 
    {
        try 
        {
            return await fn(); // Attempt the operation
        } 
        catch (error) 
        {
            const status = error.response?.status || error.status;
            if (status === 401 || status === 403 || status === 404) //maybe add other cases..?
            {
                throw error;
            }
            attempts++;
            console.warn(`Attempt ${attempts} failed:`, error.message || error);

            if (attempts < retries) 
            {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(res => setTimeout(res, delay)); // Wait before retrying
                // Optionally increase delay for exponential backoff (delay * 2)
            } 
            else 
            {
                console.error(errorMessage, error);
                throw error; // Throw error if all retries fail
            }
        }
    }
};