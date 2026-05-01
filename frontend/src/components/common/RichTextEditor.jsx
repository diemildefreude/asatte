import { Editor } from '@tinymce/tinymce-react';
import { useEffect } from 'react';

function RichTextEditor({ onChange, isReadOnly, value, quotedMessage, onQuoteApplied, placeholder=" " }) 
{
    const localCssPath = '/tinymce/my-tinymce-styles.css';
    const localScriptSrc = '/tinymce/tinymce.min.js';

    // Add useEffect to watch for quotedMessage changes
    useEffect(() => 
    {
      //console.log("message", quotedMessage);
      if (quotedMessage && window.tinymce.activeEditor) 
      {
          const editor = window.tinymce.activeEditor;

          // Wrap the message in a blockquote tag
          //style="border-left: 3px solid #ccc; padding-left: 5px; color: #CCC;"
          const quoteHtml = `
              <sub><em>${quotedMessage.sender.username} wrote:</em></sub>
              <blockquote >
                  ${quotedMessage.content}
              </blockquote>
              <p>&nbsp;</p>
          `;

          // Insert at the beginning of the document
          // 'setContent' replaces everything, or 'insertContent' puts it at the cursor
          const currentContent = editor.getContent();
          editor.setContent(quoteHtml + currentContent);
          
          // Focus the editor so the user can start typing immediately
          editor.focus();
          onQuoteApplied();
      }
    }, [quotedMessage]);

  return (
    <Editor
     // 1. Point to the local file in your public folder
      tinymceScriptSrc={localScriptSrc}
      onEditorChange={onChange}
      disabled={isReadOnly}
      // 2. Tell it you're using the open-source license
      licenseKey='gpl' 
      
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
      value={value}
    />
  );
}

export default RichTextEditor;

// import { useCallback, useEffect, useRef, useState } from 'react';
// import { useQuill } from 'react-quilljs';
// import 'quill/dist/quill.snow.css'; 
// import './RichTextEditor.css';
// import QuillStatic from 'quill'; 
// import QuillResizeImage from 'quill-resize-image';
// import { Delta } from 'quill';
// import { getVideoEmbedUrl } from '../../utils/helpers';

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// const ImageFormat = QuillStatic.import('formats/image');

// /**
//  * Custom Image Blot to handle Resizing and Alignment
//  */
// class ResizableImage extends ImageFormat {
//     static whitelist = ['width', 'height', 'align', 'imageAlign'];

//     static formats(domNode) {
//         const formats = {};
//         // Read from style OR attributes so the Delta is always aware of the current size
//         const width = domNode.style.width || domNode.getAttribute('width');
//         const height = domNode.style.height || domNode.getAttribute('height');
        
//         if (width) formats.width = width;
//         if (height) formats.height = height;

//         // Alignment logic...
//         const float = domNode.style.float;
//         const display = domNode.style.display;
//         if (display === 'block' && domNode.style.marginLeft === 'auto') {
//             formats.imageAlign = 'center';
//         } else if (float === 'right') {
//             formats.imageAlign = 'right';
//         } else if (float === 'left') {
//             formats.imageAlign = 'left';
//         }
//         return formats;
//     }

//     format(name, value) {
//         if (name === 'width' || name === 'height') {
//             if (value) {
//                 // Set the style
//                 this.domNode.style[name] = value;
//                 // ALSO set the attribute. This keeps the Resize UI in sync!
//                 // The UI box often listens to the attribute or the offsetWidth.
//                 const cleanValue = value.replace('px', '');
//                 this.domNode.setAttribute(name, cleanValue);
//             } else {
//                 this.domNode.style.removeProperty(name);
//                 this.domNode.removeAttribute(name);
//             }
//         } else if (name === 'align' || name === 'imageAlign') {
//             ResizableImage.applyAlignStyles(this.domNode, value);
//         } else {
//             super.format(name, value);
//         }
//     }

    
//     // ... create, value, and applyAlignStyles ...

//     static applyAlignStyles(node, align) 
//     {
//         node.style.removeProperty('float');
//         node.style.removeProperty('margin-left');
//         node.style.removeProperty('margin-right');
//         node.style.removeProperty('display');

//         if (align === 'center') {
//             node.style.display = 'block';
//             node.style.marginLeft = 'auto';
//             node.style.marginRight = 'auto';
//         } else if (align === 'right') {
//             node.style.display = 'inline-block';
//             node.style.float = 'right';
//             node.style.marginLeft = '1em';
//         } else if (align === 'left') {
//             node.style.display = 'inline-block';
//             node.style.float = 'left';
//             node.style.marginRight = '1em';
//         }
//     }

//     static value(domNode) {
//         return domNode.getAttribute('src');
//     }
// }

// const videoHandler = function() {
//     const url = prompt('Enter video URL:');
//     if (url) {
//         const embedUrl = getVideoEmbedUrl(url);
//         if (embedUrl) {
//             const range = this.quill.getSelection();
//             if (range) this.quill.insertEmbed(range.index, 'video', embedUrl);
//         } else {
//             alert('Invalid video URL.');
//         }
//     }
// };

// function RichTextEditor({ placeholder = 'Start typing...', quotedMessage = null, setQuotedMessage = null, readOnly = false, value, onChange, resetKey = null }) {
//     const [isContentSet, setIsContentSet] = useState(false);
//     const STORAGE_BASE_URL = `${BACKEND_URL.replace(/\/$/, '')}/storage`;
//     const editorRef = useRef(null);

//     const { quill, quillRef, Quill } = useQuill({
//         theme: 'snow',
//         placeholder,
//         readOnly,
//         formats: ['header', 'bold', 'italic', 'underline', 'strike', 'link', 'image', 'video', 'blockquote', 'list', 'align', 'color', 'background'],
//         modules: {
//             toolbar: {
//                 container: [
//                     [{ 'header': [1, 2, 3, false] }],
//                     ['bold', 'italic', 'underline', 'strike'],
//                     ['link', 'image', 'video'],
//                     [{ 'color': [] }, { 'background': [] }],
//                     [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//                     [{ 'align': [] }],
//                     ['clean'],
//                 ],
//                 handlers: { video: videoHandler }
//             },
//             resize: {}
//         },
//     });

//     if (Quill && !Quill.registered) {
//         Quill.register(ResizableImage, true);
//         Quill.register('modules/resize', QuillResizeImage);
//         Quill.registered = true;
//     }

//     const getHydratedValue = useCallback((v) => {
//         if (!Array.isArray(v)) return v;
//         return v.map(op => {
//             if (op.insert && op.insert.image) {
//                 const imgVal = op.insert.image;
//                 const rawPath = typeof imgVal === 'object' ? imgVal.image : imgVal;
                
//                 if (rawPath && (rawPath.startsWith('http') || rawPath.startsWith('data:'))) return op;

//                 if (rawPath) {
//                     const cleanPath = rawPath.replace(STORAGE_BASE_URL, '').replace(/^[\/]+|[\/]+$/g, '');
//                     const absoluteUrl = `${STORAGE_BASE_URL}/${cleanPath}`;

//                     const dbAttributes = { ...(op.attributes || {}) };
//                     if (typeof imgVal === 'object') Object.assign(dbAttributes, imgVal);

//                     const editorAttributes = { ...dbAttributes };
//                     if (editorAttributes.align) {
//                         editorAttributes.imageAlign = editorAttributes.align;
//                         delete editorAttributes.align;
//                     }

//                     return {
//                         ...op,
//                         insert: { image: absoluteUrl },
//                         attributes: editorAttributes
//                     };
//                 }
//             }
//             return op;
//         });
//     }, [STORAGE_BASE_URL]);

//     // Handle incoming text-changes and sync to parent
//     useEffect(() => 
//     {
//         if (!quill || !onChange) return;

//         const handleTextChange = () => {
//             const currentOps = quill.getContents().ops.map(op => {
//                 if (op.insert && op.insert.image) {
//                     const imageUrl = op.insert.image;
//                     const newAttributes = { ...(op.attributes || {}) };
//                     console.log("newAtt", newAttributes);
//                     if (newAttributes.imageAlign) 
//                     {
//                         newAttributes.align = newAttributes.imageAlign;
//                         delete newAttributes.imageAlign;
//                     }

//                     if (typeof imageUrl === 'string' && imageUrl.startsWith(STORAGE_BASE_URL)) {
//                         const relPath = imageUrl.replace(STORAGE_BASE_URL, '').replace(/^\/+/, '');
//                         return { 
//                             ...op, 
//                             insert: { image: relPath },
//                             attributes: newAttributes
//                         };
//                     }
//                 }
//                 return op;
//             });
//             onChange(currentOps);
//         };

//         quill.on('text-change', handleTextChange);
//         return () => quill.off('text-change', handleTextChange);
//     }, [quill, onChange, STORAGE_BASE_URL]);

//     // Initial load and sync
//     useEffect(() => {
//         if (!quill || isContentSet || !Quill?.registered) return;
//         if (value) {
//             quill.setContents(getHydratedValue(value), 'silent');
//             setIsContentSet(true);
//         }
//     }, [quill, Quill, value, getHydratedValue, isContentSet]);

//     // Force updates on resetKey change
//     useEffect(() => {
//         if (!quill || !value) return;
//         setIsContentSet(false);
//         quill.setContents(getHydratedValue(value), 'silent');
//         setIsContentSet(true);
//     }, [resetKey, getHydratedValue, quill]);

//     // Read-only toggle
//     useEffect(() => {
//         if (quill) quill.enable(!readOnly);
//     }, [quill, readOnly]);

//     // Tooltip positioning fix
//     useEffect(() => {
//         if (quill && quillRef.current) {
//             const tooltip = quill.theme.tooltip.root;
//             quillRef.current.appendChild(tooltip);
//         }
//     }, [quill, quillRef]);
// useEffect(() => {
//     if (!quill || !quillRef.current) return;
//     const el = quillRef.current;

//     const handleMouseUp = () => {
//         setTimeout(() => {
//             // 1. Move attributes to styles for persistence
//             const images = el.querySelectorAll('img');
//             images.forEach(img => {
//                 const w = img.getAttribute('width');
//                 const h = img.getAttribute('height');
//                 if (w && !w.includes('%') && !w.includes('px')) img.style.width = `${w}px`;
//                 if (h && !h.includes('%') && !h.includes('px')) img.style.height = `${h}px`;
//             });

//             // 2. Update Quill's internal state
//             quill.update('user');

//             // 3. FORCE RE-POSITIONING OF THE RESIZE UI
//             // Most resize modules have a "re-position" or "re-render" trigger.
//             // A simple way to force it is to slightly scroll or trigger a window resize event.
//             window.dispatchEvent(new Event('resize'));
//         }, 50);
//     };

//     el.addEventListener('mouseup', handleMouseUp);
//     return () => el.removeEventListener('mouseup', handleMouseUp);
// }, [quill]);

//     return (
//         <div className={`editor-container ${readOnly ? "read-only" : ""}`} ref={editorRef}>
//             <div ref={quillRef} />
//         </div>
//     );
// }

// export default RichTextEditor;