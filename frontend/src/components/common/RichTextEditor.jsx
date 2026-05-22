import { Editor } from '@tinymce/tinymce-react';
import { useEffect, useRef } from 'react';

function RichTextEditor({ onChange, isReadOnly, value, quotedMessage, onQuoteApplied, placeholder=" " }) 
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
      onInit={(evt, editor) => editorRef.current = editor}
      init={{
        height: 500,
        menubar: false,
        plugins: 'image link media',
        toolbar: isReadOnly ? false : 
            ['styles | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | image media link']
        ,
        toolbar_mode: 'wrap',
        placeholder: placeholder,       
        // image_title: true,
        // automatic_uploads: true,
        file_picker_types: 'image',
        media_live_embeds: true,
        
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
            
            // 2. If it's not a short, reject with an empty object so TinyMCE 
            // uses its own internal regex matching for normal YouTube/Vimeo links
            //reject({ msg: 'Not a YouTube Short' });
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
        object_resizing: true,
        content_css: localCssPath,
      }}
    />
  );
}

export default RichTextEditor;
