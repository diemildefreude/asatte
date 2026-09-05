import { useCallback, useEffect, useRef, useState } from "react";
import { addImageDragListeners, getImageFileFromInput, getImageUrlFromFile } from '../../utils/helpers';


function ImageField({
    index,
    image=null,
    file=null,
    alt="",
    setArray,
    onImageChange,
    onAltChange,
    onRemove,
    disabled=false,
    draggable=false,
    isDragging=false,
    isDisplacedAbove=false,
    isDisplacedBelow=false,
    onFieldDragStart,
    onFieldDragOver,
    onFieldDragEnter,
    onFieldDragLeave,
    onFieldDragEnd,
    onFieldDrop
})
{
    const [previewImage, setPreviewImage] = useState(image);
    const [imageError, setImageError] = useState('');
    const [altError, setAltError] = useState('');
    const imageFieldRef = useRef(null);
    const imageInputRef = useRef(null);
    const dragCounterRef = useRef(0);

    useEffect(() => //update preview image if image value changes. This happens on reindex.
    {

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

    const handleMouseDownOnControl = (e) =>
    {
        e.stopPropagation();
    };

    let fieldClasses = "image-field";
    if (isDragging) fieldClasses += " is-dragging";
    if (isDisplacedAbove) fieldClasses += " displace-above";
    if (isDisplacedBelow) fieldClasses += " displace-below";

    return(
    <div className={fieldClasses}
        ref={imageFieldRef}
        draggable={draggable && !disabled}
        onDragStart={(e) => onFieldDragStart && onFieldDragStart(e, index)}
        onDragOver={(e) => onFieldDragOver && onFieldDragOver(e, index)}
        onDragEnter={(e) => onFieldDragEnter && onFieldDragEnter(e, index)}
        onDragLeave={(e) => onFieldDragLeave && onFieldDragLeave(e, index)}
        onDragEnd={(e) => onFieldDragEnd && onFieldDragEnd(e, index)}
        onDrop={(e) => {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (onFieldDrop) {
                onFieldDrop(e, index);
            }
        }}
    >
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
                    <button type="button" onClick={removeSelf} disabled={disabled} onMouseDown={handleMouseDownOnControl}>-</button>
                </span>   
                <input type="file" 
                    accept=".jpg, .jpeg, .png, .webp, .bmp" 
                    name="gal_images[]" 
                    id={`gal_image_${index}`}
                    onChange={handleFileChange}
                    ref={imageInputRef}
                    disabled={disabled}
                    className="hidden-file-input"
                />    
                <label htmlFor={`gal_image_${index}`} className="link-button" onMouseDown={handleMouseDownOnControl}>
                    <i className="fa-solid fa-folder"></i>
                </label>
                <span className="file-input-label">
                    {file ? file.name : (previewImage ? (image ? 'existing image' : '1 file chosen') : 'no file chosen')}
                </span>
            </div>
            <div className="alt-input-container">
                <label htmlFor={`alt_${index}`}>alt text</label>
                <input type="text" 
                    name="alts[]" 
                    id={`alt_${index}`} 
                    value={alt ?? ""}
                    onChange={handleAltChange}
                    disabled={disabled}
                    onMouseDown={handleMouseDownOnControl}
                />
            </div>
        </div>      
        <div className={previewImage ? "img-preview-container" : "img-preview-container hidden"}>
            <img src={previewImage} alt={alt} draggable={false} />
            <div className="loading hidden">loading</div>
        </div>     
    </div>);
}
export default ImageField;
