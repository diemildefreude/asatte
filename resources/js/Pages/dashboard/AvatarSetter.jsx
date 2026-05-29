import { useCallback, useEffect, useRef, useState } from "react";
import ImageZoom from '../../Components/common/ImageZoom';
import { useForm, router } from '@inertiajs/react';
import { getErrorMessage, getImageFileFromInput, getImageUrlFromFile } from '../../utils/helpers';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function parseTransformString(transformString) 
{
    const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
    const translateMatch = transformString.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);

    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
    const posX = translateMatch ? parseFloat(translateMatch[1]) : 0;
    const posY = translateMatch ? parseFloat(translateMatch[2]) : 0;

    return { scale, posX, posY };
}

function getCroppedImage(cropperElement)
{
    const img = cropperElement.querySelector("img");

    const transformString = img.style.transform;
    const imageTransform = parseTransformString(transformString);
    const imageNaturalSize = { width: img.naturalWidth, height: img.naturalHeight };

    const cropperWidth = cropperElement.clientWidth;
    const cropperHeight = cropperElement.clientHeight;

    // Desired output width/height for the cropped image (e.g., for a profile picture)
    const outputSize = 300;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    let sx = (0 - imageTransform.posX) / imageTransform.scale;
    if (sx < 0) sx = 0; // Ensure sx is not negative

    let sy = (0 - imageTransform.posY) / imageTransform.scale;
    if (sy < 0) sy = 0; // Ensure sy is not negative

    let sWidth = cropperWidth / imageTransform.scale;
    // Ensure sWidth doesn't exceed natural width from current sx
    if (sx + sWidth > imageNaturalSize.width) {
        sWidth = imageNaturalSize.width - sx;
    }

    let sHeight = cropperHeight / imageTransform.scale;
    // Ensure sHeight doesn't exceed natural height from current sy
    if (sy + sHeight > imageNaturalSize.height) {
        sHeight = imageNaturalSize.height - sy;
    }

    const dx = 0;
    const dy = 0;
    const dWidth = canvas.width;
    const dHeight = canvas.height;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    const dataURL = canvas.toDataURL("image/webp");

    // 1. Extract Base64 and Mime Type
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1]; // e.g., "image/webp"
    const base64Data = arr[1];

    // 2. Convert base64 to Blob
    const bstr = atob(base64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });

    return blob;
}

function AvatarSetter({user, setSuccess, setError, isSubmitting, setIsSubmitting})
{
    const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const fileInputRef = useRef(null);
    const imageCropContainerContainerRef = useRef(null);
    const imageCropContainerRef = useRef(null);
    const imageCropButtonRef = useRef(null);
    const avatarContainerRef = useRef(null);

    const avatar = user?.avatar ? `${BACKEND_URL}/storage/images/uploaded/users/${user.username}/avatar/small/${user?.avatar}` 
        : `${BACKEND_URL}/storage/images/defaults/avatar.webp`;
    const form = useForm({ avatar: null });

    const closeCropperAndClearInput = useCallback(() => 
    {
        setIsImageCropperOpen(false);
        setSelectedAvatar(null); 
        if (fileInputRef.current) 
        {
            fileInputRef.current.value = "";
        }
    }, [setIsImageCropperOpen, setSelectedAvatar]);

    const handleCropAndUpload = useCallback(async () =>
    {
        setIsImageCropperOpen(false);
        const resizedImage = getCroppedImage(imageCropContainerRef.current);        
        
        setSuccess('');
        setError('');
        setIsSubmitting(true);
        form.setData('avatar', resizedImage);
        form.post('/update-avatar', {
            onSuccess: () => {
                setSuccess('Avatar successfully updated.');
                setSelectedAvatar(null);
            },
            onError: (err) => {
                const errMsg = getErrorMessage(err);
                setError(errMsg.trim());
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });

    },[setIsImageCropperOpen, imageCropContainerRef.current, 
        setSuccess, setError, setIsSubmitting,// updateAvatar, 
        setSelectedAvatar]);

    const handleFileSelect = useCallback(async (e) =>
    {
        setError('');
        setSuccess('');
        const file = getImageFileFromInput(e);
        if(!file)
        {
            setError("Must be .jpeg, .png, .webp, or .bmp");
            return;
        }
        console.log("opening");
        setIsImageCropperOpen(true);
        const selectedFileUrl = await getImageUrlFromFile(file);
        setSelectedAvatar(selectedFileUrl);
    },[setIsImageCropperOpen, setSelectedAvatar]);

    const handleDragOver = useCallback((e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        avatarContainerRef.current.classList.toggle('dragged-over', true);
    },[avatarContainerRef.current]);

    const handleDragLeave = useCallback((e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        avatarContainerRef.current.classList.toggle('dragged-over', false);
    },[avatarContainerRef.current]);

    const handleDrop = useCallback((e) =>
    {
        e.preventDefault();
        e.stopPropagation();
        avatarContainerRef.current.classList.toggle('dragged-over', false);
        handleFileSelect(e);
    }, [avatarContainerRef.current])

    useEffect(() =>
    {
        if(!avatarContainerRef.current)
        {
            return;
        }
        const avRef = avatarContainerRef.current;
        avRef.addEventListener("dragover", handleDragOver);
        avRef.addEventListener("dragleave", handleDragLeave);
        avRef.addEventListener("drop", handleDrop);
        return() =>
        {
            avRef.removeEventListener("dragover", handleDragOver);
            avRef.removeEventListener("dragleave", handleDragLeave);
            avRef.removeEventListener("drop", handleDrop);
        }
    }, [avatarContainerRef.current]);

    useEffect(() =>
    {
        document.body.classList.toggle("no-scroll", isImageCropperOpen);
    },[isImageCropperOpen]);

    const handleClickOut = useCallback((e) =>
    {        
        if(!imageCropContainerRef.current || !imageCropButtonRef.current)
        {
            return;
        }
        if (imageCropContainerRef.current.contains(e.target) 
            || imageCropButtonRef.current.contains(e.target))
        {
            return;
        }
        closeCropperAndClearInput();
    },[closeCropperAndClearInput, imageCropContainerRef.current]);

    const handleEscOut = useCallback((e) =>
    {        
        if(!imageCropContainerRef.current || !imageCropButtonRef.current)
        {
            return;
        }
        if (e.key === "Escape")
        { 
            closeCropperAndClearInput();
        }
    },[closeCropperAndClearInput, imageCropContainerRef.current]);

    const handleTouchOut = useCallback((e) =>
    {
        if(e.touches.length !== 1)
        {
            return;
        }
        if (imageCropContainerRef.current && imageCropContainerRef.current.contains(e.touches[0].target))
        {
            return;
        }
        closeCropperAndClearInput();
    }, [closeCropperAndClearInput, imageCropContainerRef.current]);

    useEffect(() =>
    {
        const contContRef = imageCropContainerContainerRef.current;
        if(!contContRef)
        {
            return;
        }
        contContRef.addEventListener('mousedown', handleClickOut);
        contContRef.addEventListener('touchstart', handleTouchOut);
        window.addEventListener('keydown', handleEscOut);
        
        return () =>
        {
            contContRef.removeEventListener('mousedown', handleClickOut);
            contContRef.removeEventListener('touchstart', handleTouchOut);
            window.removeEventListener('keydown', handleEscOut);
        }
    },[handleClickOut, handleTouchOut, handleEscOut])
    
    const handleUpdateClick = useCallback(() =>
    {
        fileInputRef.current.click();
    },[fileInputRef.current]);

    return(
        <>
        {
            isImageCropperOpen && (
            <div className="image-crop-container-container"
                ref={imageCropContainerContainerRef}
            >
                <h3>Zoom or drag to crop image.</h3>
                <div className="image-crop-container"
                    ref={imageCropContainerRef}
                >
                    <div className="image-crop-circle"></div>
                    <ImageZoom src={selectedAvatar} 
                        alt="selected profile image"
                        isImageCropper={true}
                        outerContainerRef={imageCropContainerRef}
                    />
                </div>
                <button type="button" onClick={handleCropAndUpload} 
                    disabled={isSubmitting} ref={imageCropButtonRef}
                >
                    update
                </button>
            </div>
            )
        }
        <div className="profile-avatar-container" ref={avatarContainerRef}>
            <label htmlFor="profile_image" className="hidden"
            ></label>
            <input type="file" accept=".jpg, .jpeg, .png, .webp, .bmp" name="profile_image" 
                id="profile_image" style={{ display: 'none' }} ref={fileInputRef} 
                onChange={handleFileSelect} placeholder={null}
            />    
            <button className="avatar-button"
                onClick={handleUpdateClick}   
                disabled={isSubmitting} 
                type="button"
            >
                update
                <div className="image-drag-panel"></div>
            </button>
            <img src={avatar} alt="" className="round-image" />
        </div>
        </>
    );
}

export default AvatarSetter;