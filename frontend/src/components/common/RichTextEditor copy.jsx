import Quill from 'quill';

import ImageResize from '@taoqf/quill-image-resize-module';

import 'quill/dist/quill.snow.css';

import { useCallback, useEffect, useRef, useState } from 'react';



function RichTextEditor({ value, onChange, readOnly = false, placeholder = 'Start typing...' })

{

    const editorRef = useRef(null);

    const quillInstanceRef = useRef(null);

    const [isQuillInitialized, setIsQuillInitialized] = useState(false);



    Quill.register('modules/imageResize', ImageResize);



    const handleVideoInsertion = useCallback(function()

    {

        const url = prompt('Enter video URL:');

        if (url) {

            const range = this.quill.getSelection();

            if (range) {

                this.quill.insertEmbed(range.index, 'video', url);

            }

        }

    }, []);



    useEffect(() =>

    {

        const quill = new Quill(editorRef.current,

        {

            theme: 'snow',

            placeholder: placeholder,

            readOnly: readOnly,

            modules:

            {

                toolbar:

                {

                    container:

                    [

                        [{ 'header': [1, 2, 3, false] }],

                        ['bold', 'italic', 'underline', 'strike'],

                        ['link', 'image', 'video'],

                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],

                        [{ 'align': [] }],

                        ['clean']

                    ],

                    handlers:

                    {

                        video: handleVideoInsertion

                    }

                },

                imageResize:

                {

                    // Options for the image resize module

                }

            }

        });

       

        quillInstanceRef.current = quill;

        setIsQuillInitialized(true);

        if (value)

        { //format            

            quill.setContents(value);

        }



        quill.on('text-change', () =>

        {

            if (onChange) {

                // Get the content in Quill's Delta format

                const delta = quill.getContents();

                // Or get HTML: const html = quill.root.innerHTML;

                onChange(delta);

            }

        });

        return () =>

        {

            if (quillInstanceRef.current && editorRef.current)

            {

                quillInstanceRef.current.off('text-change'); // Remove event listener

                // Quill doesn't have a direct 'destroy' method,

                // but setting the ref to null helps with garbage collection.

                quillInstanceRef.current = null;

                console.log("er.c", editorRef.current);

                editorRef.current.innerHTML = ''; // Clear the editor div

                setIsQuillInitialized(false);

            }

        };

    }, [handleVideoInsertion, placeholder, readOnly, value, onChange]);



    useEffect(() =>

    {

        if (quillInstanceRef.current && isQuillInitialized)

        {

            quillInstanceRef.current.enable(!readOnly); // enable(false) sets to readOnly

        }

    }, [readOnly, isQuillInitialized]);



    return (

        <div className="quill-editor-container">

            <div ref={editorRef} id="editor"></div>

        </div>

    );

}


