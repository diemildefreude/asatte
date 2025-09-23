import { useEffect, useRef, useState } from 'react';

import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'; 
import './RichTextEditor.css';
import QuillStatic from 'quill'; // Renamed to avoid conflict with `Quill` from useQuill
import QuillResizeImage from 'quill-resize-image';
import { getVideoEmbedUrl, resizeImage } from '../../utils/helpers';
QuillStatic.register('modules/resize', QuillResizeImage);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const videoHandler = function()
{
    const url = prompt('Enter video URL:');
    if (url) 
    {
        const embedUrl = getVideoEmbedUrl(url); // Extract the ID
        if (embedUrl) 
        {
            const range = this.quill.getSelection();
            if (range) 
            {
                this.quill.insertEmbed(range.index, 'video', embedUrl);
            }
        } 
        else 
        {
            alert('Invalid video URL. Please enter a valid link from YouTube, Vimeo, DailyMotion, or Youku.');
        }
    }
}

function RichTextEditor({placeholder = 'Start typing...', readOnly = false, value, onChange })
{
    const [isContentSet, setIsContentSet] = useState(false);
    const STORAGE_BASE_URL = `${BACKEND_URL}/storage`;
    const editorRef = useRef(null);
    let editorClasses = "editor-container";
    editorClasses += readOnly ? " read-only" : "";

    const { quill, quillRef, Quill} = useQuill({
        theme: 'snow',
        placeholder: placeholder,
        readOnly: readOnly,
        modules: { 
            toolbar:
            {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['link', 'image', 'video'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['clean'],
                ],
                handlers:
                {
                    video: videoHandler,
                    //image: imageHandler
                }
            },
            resize: {} },
    });

    useEffect(() =>
    {
        if(!quill)
        {
            return;
        }   
        const handleTextChange = () => 
        {
            if(!onChange) { return; }
            
            // Convert absolute URLs back to relative paths for storage
            const currentContentOps = quill.getContents().ops.map(op => 
            {
                if (op.insert && op.insert.image) 
                {
                    const imageUrl = op.insert.image;
                    // Check if the image URL starts with the base URL
                    if (imageUrl.startsWith(STORAGE_BASE_URL)) 
                    {
                        const relPath = imageUrl.substring(STORAGE_BASE_URL.length + 1); //+1 for '/'
                        //console.log(relPath);
                        // Strip the base URL and keep only the relative path
                        return {
                            insert: { image: relPath }
                        };
                    }
                }
                // Return the operation unchanged if it's not an image or if the path is not a remote URL
                return op;
            });
 
            onChange(currentContentOps);
        }

        quill.on('text-change', (delta, oldDelta, source) =>
        {
            if(source === 'user')
            {
                handleTextChange();
            }
        });
        return () => 
        {
            if (quill) 
            {
                quill.off('text-change', handleTextChange);
            }
        };
    },[quill, onChange]);

    useEffect(() =>
    {
        if(!quill)
        {return;}
        quill.enable(!readOnly);
    },[quill, readOnly]);

    useEffect(() =>
    {        
        if(!quill || isContentSet)
        {
            return;
        }

        if (!value || typeof value !== 'object' || value === null
            || value.length === 0) 
        {
            return;
        }

    // Convert relative image paths to absolute URLs for display
        const hydratedValue = value.map(op => 
        {
        if (op.insert && typeof op.insert.image === 'string') 
        {
            // Check if the path is relative (doesn't start with http or data)
            const imageUrl = op.insert.image;
            if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) 
            {
                return {
                    insert: { image: `${STORAGE_BASE_URL}/${imageUrl}` }
                };
            }
        }
        return op;
        });

        const currentEditorContent = JSON.stringify(quill.getContents().ops);
        const newEditorContent = JSON.stringify(hydratedValue);

        //console.log("compare", currentEditorContent, newEditorContent);
        if(currentEditorContent !== newEditorContent)
        {
            //console.log("setting", value);
            quill.setContents(hydratedValue);
            setIsContentSet(true);
        }        
    },[quill, value]);

    useEffect(() =>
    {
        const currentEditor = editorRef.current;
        currentEditor.parentElement.classList.toggle('read-only', readOnly);
    },[readOnly]);

  return (
    <div className={editorClasses} ref={editorRef}>
        <div ref={quillRef} />
    </div>
  );
};

export default RichTextEditor;