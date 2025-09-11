import { useCallback, useEffect, useRef, useState } from "react";
import { addImageDragListeners, getImageFileFromInput, getImageUrlFromFile } from "../../../utils/helpers";


function ImageField({index, image=null, file=null, alt="", setArray, onImageChange, onAltChange, onRemove })
{
    const [previewImage, setPreviewImage] = useState(image);
    const [imageError, setImageError] = useState('');
    const [altError, setAltError] = useState('');
    const imageFieldRef = useRef(null);
    const imageInputRef = useRef(null);
    const dragCounterRef = useRef(0);

    useEffect(() => //update preview image if image value changes. This happens on reindex.
    {
        //console.log("image?", image);
        if(image)
        {
            setPreviewImage(image);
        }
    },[image, setPreviewImage]);
   
    useEffect(() =>
    {
        if(!file)
        {
            return;
        }
        const dT = new DataTransfer();
        dT.items.add(file);
        imageInputRef.current.files = dT.files;
    },[file, /*imageInputRef.current*/]);

    const handleDroppedImage = useCallback(async (e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        if(imageFieldRef.current)
        {
            imageFieldRef.current.classList.toggle('dragged-over', false);
        }
        
        setImageError('');
        const file = getImageFileFromInput(e);
        if(!file)
        {
            setImageError("Files must be images of type jpg, png, webp or bmp.");
            return;
        }
        const url = await getImageUrlFromFile(file);
        onImageChange(index, file, url);
        setPreviewImage(url);
    },[dragCounterRef, imageFieldRef, index,
        setImageError, onImageChange, setPreviewImage]);

    useEffect(() =>
    {
        const fieldCont = imageFieldRef.current;
        if(!fieldCont)
        {
            return;
        }
        const cleanup = addImageDragListeners(fieldCont, dragCounterRef, handleDroppedImage);

        return cleanup;        
    },[imageFieldRef, dragCounterRef, handleDroppedImage]);

    const removeSelf = useCallback((e) =>
    {
        onRemove();
        e.preventDefault();
        setArray((prevFields) =>
        {
            const filteredArray = prevFields.filter(field => field.index !== index);
            const reindexedArray = filteredArray.map((field, i) => 
            {
                return { ...field, index: i };
            });
            return reindexedArray;
        });
    },[index, setArray, onRemove]);

    const handleFileChange = useCallback(async (e) =>
    {
        setImageError('');
        const file = getImageFileFromInput(e);
        if(!file)
        {
            setImageError("Must be .jpeg, .png, .webp, or .bmp");
            return;
        }
        const selectedFileUrl = await getImageUrlFromFile(file);
        setPreviewImage(selectedFileUrl);
        onImageChange(index, file, selectedFileUrl);
    },[setImageError, onImageChange, index]);

    const handleAltChange = useCallback((e) =>
    {
        setAltError('');
        let altText = e.target.value;
        if(altText.length > 500)
        {
            altText = altText.substring(0, 500);
            setAltError('alt text cannot be longer than 500 characters');
        }
        onAltChange(index, altText);
    },[setAltError, index, onAltChange]);

    return(
    <div className="image-field" ref={imageFieldRef}>
        {imageError && (
        <div className="error">
            {imageError}
        </div>
        )}
        {altError && (
        <div className="error">
            {altError}
        </div>
        )}
        <div className="sub-field">
            <div className="remove-input-container">        
                <span className="button-container">
                    <button type="button" onClick={removeSelf}>-</button>
                </span>   
                <input type="file" 
                    accept=".jpg, .jpeg, .png, .webp, .bmp" 
                    name="gal_images[]" 
                    id={`gal_image_${index}`}
                    onChange={handleFileChange}
                    ref={imageInputRef}
                />    
            </div>
            <div className="alt-input-container">
                <label htmlFor={`alt_${index}`}>alt text</label>
                <input type="text" 
                    name="alts[]" 
                    id={`alt_${index}`} 
                    value={alt ?? ""}
                    onChange={handleAltChange}
                />
            </div>
        </div>      
        <div className={previewImage ? "img-preview-container" : "img-preview-container hidden"}>
            <img src={previewImage} alt={alt}/>
            <div className="loading hidden">loading</div>
        </div>     
    </div>);
}
export default ImageField;