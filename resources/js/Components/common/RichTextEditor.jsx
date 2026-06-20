import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useRef } from 'react';
import './RichTextEditor.css';

function RichTextEditor({ onChange, isReadOnly, value, quotedMessage, onQuoteApplied, placeholder=" ", autoFocus = false }) 
{
    const editorRef = useRef(null);
    const localCssPath = '/tinymce/my-tinymce-styles.css';
    const localScriptSrc = '/tinymce/tinymce.min.js';

    // Add useEffect to watch for quotedMessage changes
    useEffect(() => 
    {
      //console.log("message", quotedMessage);
      if (quotedMessage && editorRef.current) 
      {
          const editor = editorRef.current;

          const safeContent = quotedMessage.content || "";
          const username = quotedMessage.sender?.username || null;
          
          let quoteHtml = username ? `<sub><em>${quotedMessage.sender.username} wrote:</em></sub>` : "";
          quoteHtml += `
              <blockquote >
                  ${safeContent}
              </blockquote>
              <p>&nbsp;</p>
          `;
          console.log("editor", editor);

          const currentContent = editor.getContent() || "";
          editor.setContent(quoteHtml + currentContent);
          
          // Focus the editor so the user can start typing immediately
          editor.focus();
          onQuoteApplied();
      }
    }, [quotedMessage, onQuoteApplied]);

  return (
    <Editor
     // 1. Point to the local file in your public folder
      tinymceScriptSrc={localScriptSrc}
      onEditorChange={onChange}
      disabled={isReadOnly}
      // 2. Tell it you're using the open-source license
      licenseKey='gpl' 
      value={typeof value === 'string' ? value : ""}
      editorRef={editorRef}
      onInit={(evt, editor) => {
        editorRef.current = editor;
        if (autoFocus) {
          editor.focus();
        }
      }}
      init={{
        height: 500,
        convert_urls: false,
        menubar: false,
        plugins: 'image link media',
        toolbar: isReadOnly ? false : 
            ['styles | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | image media link']
        ,
        extended_valid_elements: 'blockquote[class|data-instgrm-permalink|data-instgrm-version|data-instgrm-captioned|data-instgrm-payload-id|data-video-id|cite|data-theme|data-dnt|data-media-max-width],iframe[src|title|width|height|frameborder|allowfullscreen|scrolling|allow|style]',
        toolbar_mode: 'wrap',
        mobile: {
            toolbar_mode: 'wrap'
        },
        placeholder: placeholder,       
        // image_title: true,
        // automatic_uploads: true,
        sandbox_iframes: false,
        file_picker_types: 'image',
        media_live_embeds: true,
        setup: (editor) => {
          editor.on('BeforeSetContent', (e) => {
            if (!e.content) return;

            // Convert raw pasted Twitter/X embed blockquotes into static iframes instantly
            if (e.content.includes('twitter-tweet')) {
              e.content = e.content.replace(/<blockquote class="[^"]*twitter-tweet[^"]*"[^>]*>[\s\S]*?href="https:\/\/(?:twitter|x)\.com\/[^\/]+\/status\/(\d+)[^"]*"[\s\S]*?<\/blockquote>(?:\s*<script[^>]*>[\s\S]*?<\/script>)?/ig, (match, tweetId) => {
                  return `<iframe src="https://platform.twitter.com/embed/Tweet.html?id=${tweetId}" width="550" height="600" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
              });
            }

            // Convert raw pasted Instagram embed blockquotes into static iframes instantly
            if (e.content.includes('instagram-media')) {
              e.content = e.content.replace(/<blockquote class="[^"]*instagram-media[^"]*"[^>]*data-instgrm-permalink="https:\/\/(?:www\.)?instagram\.com\/(?:[^\/]+\/)?(?:p|reel|tv)\/([a-zA-Z0-9_-]+)[^"]*"[\s\S]*?<\/blockquote>(?:\s*<script[^>]*>[\s\S]*?<\/script>)?/ig, (match, igId) => {
                  return `<iframe src="https://www.instagram.com/p/${igId}/embed/captioned" width="540" height="700" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
              });
            }

            // Convert raw pasted TikTok embed blockquotes into static iframes instantly
            if (e.content.includes('tiktok-embed')) {
              e.content = e.content.replace(/<blockquote class="[^"]*tiktok-embed[^"]*"[^>]*cite="https:\/\/(?:www\.)?tiktok\.com\/[^\/]+\/video\/(\d+)[^"]*"[\s\S]*?<\/blockquote>(?:\s*<script[^>]*>[\s\S]*?<\/script>)?/ig, (match, videoId) => {
                  return `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" width="325" height="740" frameborder="0" scrolling="no" allow="fullscreen" style="max-width: 100%; overflow: hidden;"></iframe>`;
              });
            }

            // Clean up frontend layout wrappers that might be pasted in from the public site
            if (e.content.includes('iframe-container') || e.content.includes('statement')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = e.content;
                const unwrapClasses = ['.iframe-container-container', '.iframe-container', '.statement'];
                
                unwrapClasses.forEach(selector => {
                    const elements = Array.from(tempDiv.querySelectorAll(selector));
                    // Reverse to unwrap deepest first
                    elements.reverse().forEach(el => {
                        if (el.parentNode) {
                            while (el.firstChild) {
                                el.parentNode.insertBefore(el.firstChild, el);
                            }
                            el.parentNode.removeChild(el);
                        }
                    });
                });
                
                e.content = tempDiv.innerHTML;
            }
          });

          editor.on('init', () => {
            const editorWin = editor.getWin();
            const editorDoc = editor.getDoc();
            if (!editorWin || !editorDoc) return;
            
            editorWin.addEventListener('message', (event) => {
                let data;
                try {
                    data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                } catch (e) {
                    return;
                }

                if (data && data['twttr.embed'] && data['twttr.embed'].method === 'twttr.private.resize') {
                    const height = data['twttr.embed'].params[0].height;
                    const iframes = editorDoc.querySelectorAll('iframe[src*="platform.twitter.com/embed/Tweet.html"]');
                    for (let i = 0; i < iframes.length; i++) {
                        if (iframes[i].contentWindow === event.source) {
                            iframes[i].style.height = `${height + 4}px`;
                            break;
                        }
                    }
                }

                if (data && data.type === 'MEASURE' && data.details && data.details.height) {
                    const height = data.details.height;
                    const iframes = editorDoc.querySelectorAll('iframe[src*="instagram.com"]');
                    for (let i = 0; i < iframes.length; i++) {
                        if (iframes[i].contentWindow === event.source) {
                            iframes[i].style.height = `${height + 4}px`;
                            break;
                        }
                    }
                }
            });
          });
          // Smart bottom-tap focus handler for mobile devices
          editor.on('click', (e) => {
              if (e.target.nodeName === 'BODY') {
                  const body = editor.getBody();
                  if (!body || !body.lastElementChild) return;
                  
                  const rect = body.lastElementChild.getBoundingClientRect();
                  // Check if click was visually below the last content block
                  if (e.clientY > rect.bottom - 10) {
                      let lastEl = body.lastElementChild;
                      
                      // If the last element is an iframe/image wrapper, append a safe new line
                      if (lastEl.querySelector('.mce-preview-object, iframe, img') || ['IFRAME', 'IMG', 'VIDEO'].includes(lastEl.nodeName)) {
                          const newP = editor.getDoc().createElement('p');
                          newP.innerHTML = '<br data-mce-bogus="1">';
                          body.appendChild(newP);
                          lastEl = newP;
                      }
                      
                      // Explicitly place the caret inside the final element
                      editor.selection.setCursorLocation(lastEl, 0);
                  }
              }
          });

          // Mobile Backspace Fix: Delete embeds natively instead of selecting them (which closes virtual keyboards)
          editor.on('keydown beforeinput', (e) => {
              const isBackspace = e.type === 'keydown' && (e.key === 'Backspace' || e.keyCode === 8);
              const isDeleteBackward = e.type === 'beforeinput' && e.inputType === 'deleteContentBackward';
              
              if (isBackspace || isDeleteBackward) {
                  const sel = editor.selection;
                  if (!sel.isCollapsed()) return;

                  const rng = sel.getRng();
                  let currentNode = rng.startContainer;
                  let offset = rng.startOffset;

                  console.log("--- BACKSPACE INTERCEPTED ---");
                  console.log("Event type:", e.type);
                  console.log("Caret nodeType:", currentNode.nodeType);
                  console.log("Caret nodeName:", currentNode.nodeName);
                  console.log("Caret offset:", offset);
                  console.log("Caret textContent:", currentNode.textContent);
                  console.log("Parent block HTML:", editor.dom.getParent(currentNode, editor.dom.isBlock)?.innerHTML);

                  const isEmbedNode = (node) => node && (['IFRAME', 'IMG', 'VIDEO', 'FIGURE'].includes(node.nodeName) || (node.classList && node.classList.contains('mce-preview-object')));

                  let embedToDelete = null;
                  let wrapperToClean = null;

                  // Evaluate previous sibling if in a text node
                  if (currentNode.nodeType === 3 && offset === 0) {
                      console.log("Caret is at the start of a text node. Prev Sibling:", currentNode.previousSibling?.nodeName);
                      if (currentNode.previousSibling && isEmbedNode(currentNode.previousSibling)) {
                          embedToDelete = currentNode.previousSibling;
                      } else if (currentNode.previousSibling && currentNode.previousSibling.nodeType === 1 && isEmbedNode(currentNode.previousSibling.lastChild)) {
                          embedToDelete = currentNode.previousSibling.lastChild;
                          wrapperToClean = currentNode.previousSibling;
                      }
                  }

                  // Case 1: Caret is inside a block, immediately after the embed node (e.g. after a paragraph merge)
                  if (!embedToDelete && currentNode.nodeType === 1 && offset > 0) {
                      const prevNode = currentNode.childNodes[offset - 1];
                      console.log("Caret is inside an element. Prev Node:", prevNode?.nodeName);
                      if (isEmbedNode(prevNode)) {
                          embedToDelete = prevNode;
                      } else if (prevNode && prevNode.nodeType === 1 && isEmbedNode(prevNode.lastChild)) {
                          embedToDelete = prevNode.lastChild;
                          wrapperToClean = prevNode;
                      }
                  }

                  // Case 2: Caret is at the absolute beginning of a text node or block, look at the preceding block
                  if (!embedToDelete && offset === 0) {
                      let currentBlock = currentNode.nodeType === 3 ? currentNode.parentNode : currentNode;
                      
                      while (currentBlock && !editor.dom.isBlock(currentBlock) && currentBlock.nodeName !== 'BODY') {
                          currentBlock = currentBlock.parentNode;
                      }

                      if (currentBlock && currentBlock.previousSibling) {
                          const prevBlock = currentBlock.previousSibling;
                          console.log("Checking previous block:", prevBlock.nodeName, prevBlock.innerHTML);
                          
                          if (isEmbedNode(prevBlock)) {
                              embedToDelete = prevBlock;
                          } else if (prevBlock.lastChild && isEmbedNode(prevBlock.lastChild)) {
                              embedToDelete = prevBlock.lastChild;
                              wrapperToClean = prevBlock;
                          } else if (prevBlock.querySelector) {
                              const embeds = prevBlock.querySelectorAll('iframe, img, video, figure, .mce-preview-object');
                              if (embeds.length > 0) {
                                  embedToDelete = embeds[embeds.length - 1];
                                  wrapperToClean = prevBlock;
                              }
                          }
                      }
                  }

                  console.log("Embed to delete identified:", embedToDelete ? embedToDelete.nodeName : "None");

                  if (embedToDelete) {
                      e.preventDefault();
                      editor.dom.remove(embedToDelete);
                      console.log("Embed deleted natively!");
                      
                      // Clean up empty wrapper block so no ghost spacing is left behind
                      if (wrapperToClean && wrapperToClean !== embedToDelete && !wrapperToClean.textContent.trim() && !wrapperToClean.querySelector('img, iframe, video')) {
                          editor.dom.remove(wrapperToClean);
                          console.log("Empty wrapper block deleted!");
                      }
                  }
              }
          });
        },
        
        media_url_resolver: (data) => {
          return new Promise((resolve, reject) => {
            // 1. Check if the URL is a YouTube Short
            if (data.url && data.url.includes('youtube.com/shorts/')) {
              const match = data.url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
              if (match && match[1]) {
                const videoId = match[1];
                const embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                
                // Resolve with the HTML embed string
                resolve({ html: embedHtml });
                return;
              }
            }
            
            // 2. Instagram Post/Reel Converter
            if (data.url && (data.url.includes('instagram.com/') && (data.url.includes('/p/') || data.url.includes('/reel/')))) {
              const match = data.url.match(/instagram\.com\/(?:[^\/]+\/)?(p|reel)\/([a-zA-Z0-9_-]+)/);
              if (match && match[2]) {
                const embedHtml = `<iframe src="https://www.instagram.com/p/${match[2]}/embed/captioned" width="540" height="700" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }

            // 3. TikTok Video Converter (Safe static iframe)
            if (data.url && data.url.includes('tiktok.com/')) {
              const match = data.url.match(/tiktok\.com\/.*\/video\/(\d+)/);
              if (match && match[1]) {
                const embedHtml = `<iframe src="https://www.tiktok.com/embed/v2/${match[1]}" width="325" height="740" frameborder="0" scrolling="no" allow="fullscreen" style="max-width: 100%; overflow: hidden;"></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }

            // 4. Twitter / X Converter
            if (data.url && (data.url.includes('twitter.com/') || data.url.includes('x.com/'))) {
              const match = data.url.match(/(twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
              if (match && match[3]) {
                const embedHtml = `<iframe src="https://platform.twitter.com/embed/Tweet.html?id=${match[3]}" width="550" height="600" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }

            // 4.5 Vimeo Strict 16:9 Converter
            if (data.url && data.url.includes('vimeo.com/')) {
              const match = data.url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
              if (match && match[1]) {
                const embedHtml = `<iframe src="https://player.vimeo.com/video/${match[1]}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }
            
            // 5. If none match, return empty so TinyMCE uses default fallback
            resolve({ html: '' });
          });
        },

        file_picker_callback: (cb, value, meta) => 
        {
            // Use the editor instance provided by the callback context
            // or use the global window.tinymce
            const editor = window.tinymce.activeEditor; 
            
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');

            input.addEventListener('change', (e) => 
            {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                const id = 'blobid' + (new Date()).getTime();
                
                // Use the 'editor' instance to get the blobCache
                const blobCache = editor.editorUpload.blobCache;
                
                const base64 = reader.result.split(',')[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);

                cb(blobInfo.blobUri(), { title: file.name });
                };
                reader.readAsDataURL(file);
            });

            input.click();
        },

        toolbar_mode: 'wrap', 
        object_resizing: 'img,iframe,video,figure',
        content_css: localCssPath,

      }}
    />
  );
}

export default RichTextEditor;
