import { useCallback, useEffect, useRef, useState } from "react";
import ImageZoom from '../../Components/common/ImageZoom';
import { useForm, usePage, router } from '@inertiajs/react';
import { getErrorMessage, getImageFileFromInput, getImageUrlFromFile } from '../../utils/helpers';

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
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;

    const transformString = img.style.transform;
    const { scale, posX, posY } = parseTransformString(transformString);

    const W_nat = img.naturalWidth;
    const H_nat = img.naturalHeight;
    const C_w = cropperElement.clientWidth;
    const C_h = cropperElement.clientHeight;

    const outputSize = 800;

    // Convert cropper viewport coordinates to natural image coordinate space
    const sx = (0 - posX) / scale;
    const sy = (0 - posY) / scale;
    const sw = C_w / scale;
    const sh = C_h / scale;

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill background solid black to eliminate transparent border artifacts on WebP/JPEG export
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Map natural source crop (sx, sy, sw, sh) -> destination (dx, dy, dw, dh)
    let srcX = sx;
    let srcY = sy;
    let srcW = sw;
    let srcH = sh;

    let dstX = 0;
    let dstY = 0;
    let dstW = outputSize;
    let dstH = outputSize;

    // Proportional clamping for out-of-bounds panning
    if (srcX < 0) {
        const overflowRatio = Math.abs(srcX) / sw;
        dstX = outputSize * overflowRatio;
        dstW -= dstX;
        srcW += srcX;
        srcX = 0;
    }
    if (srcY < 0) {
        const overflowRatio = Math.abs(srcY) / sh;
        dstY = outputSize * overflowRatio;
        dstH -= dstY;
        srcH += srcY;
        srcY = 0;
    }
    if (srcX + srcW > W_nat) {
        const overflowRatio = (srcX + srcW - W_nat) / sw;
        dstW -= outputSize * overflowRatio;
        srcW = W_nat - srcX;
    }
    if (srcY + srcH > H_nat) {
        const overflowRatio = (srcY + srcH - H_nat) / sh;
        dstH -= outputSize * overflowRatio;
        srcH = H_nat - srcY;
    }

    if (srcW > 0 && srcH > 0 && dstW > 0 && dstH > 0) {
        ctx.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
    }

    const dataURL = canvas.toDataURL("image/webp", 0.95);

    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const base64Data = arr[1];

    const bstr = atob(base64Data);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function AvatarSetter({user})
{
    const { props } = usePage();
    const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [zoomFactor, setZoomFactor] = useState(1.0);
    const fileInputRef = useRef(null);
    const imageCropContainerContainerRef = useRef(null);
    const imageCropContainerRef = useRef(null);
    const imageCropButtonRef = useRef(null);
    const imageCropSliderRef = useRef(null);
    const avatarContainerRef = useRef(null);

    const avatar = user?.avatar ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/small/${user?.avatar}` 
        : `${props.app_url}/images/defaults/avatar.webp?v=2`;
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({ avatar: null });

    const closeCropperAndClearInput = useCallback(() => 
    {
        setIsImageCropperOpen(false);
        setSelectedAvatar(null); 
        setZoomFactor(1.0);
        if (fileInputRef.current) 
        {
            fileInputRef.current.value = "";
        }
    }, [setIsImageCropperOpen, setSelectedAvatar]);

    const handleCropAndUpload = useCallback(async () =>
    {
        setIsImageCropperOpen(false);
        const resizedImage = getCroppedImage(imageCropContainerRef.current);        
        
        clearErrors();
        setData('avatar', resizedImage);
        post('/update-avatar', {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedAvatar(null);
                setZoomFactor(1.0);
            },
            onError: (err) => {
                const errMsg = getErrorMessage(err);
                setError('avatar', errMsg.trim());
            }
        });

    },[setIsImageCropperOpen, post, setData, setError, clearErrors]);

    const handleFileSelect = useCallback(async (e) =>
    {
        clearErrors();
        const file = getImageFileFromInput(e);
        if(!file)
        {
            setError('avatar', "Must be .jpeg, .png, .webp, or .bmp");
            return;
        }
        
        setZoomFactor(1.0);
        setIsImageCropperOpen(true);
        const selectedFileUrl = await getImageUrlFromFile(file);
        setSelectedAvatar(selectedFileUrl);
    },[setIsImageCropperOpen, setSelectedAvatar, clearErrors, setError]);

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
            || imageCropButtonRef.current.contains(e.target)
            || (imageCropSliderRef.current && imageCropSliderRef.current.contains(e.target)))
        {
            return;
        }
        closeCropperAndClearInput();
    },[closeCropperAndClearInput]);

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
    },[closeCropperAndClearInput]);

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
        if (imageCropButtonRef.current && imageCropButtonRef.current.contains(e.touches[0].target))
        {
            return;
        }
        if (imageCropSliderRef.current && imageCropSliderRef.current.contains(e.touches[0].target))
        {
            return;
        }
        closeCropperAndClearInput();
    }, [closeCropperAndClearInput]);

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
                <h3>Zoom and drag to crop image.</h3>
                <div className="horizontal-buttons-container">
                    <button type="button" onClick={handleCropAndUpload} 
                        disabled={!user?.is_email_verified || processing} ref={imageCropButtonRef}
                    >
                        update
                    </button>
                    <button type="button" className="red-button" onClick={() => setIsImageCropperOpen(false)} >
                        cancel
                    </button>
                </div>                
                <div className="image-crop-container"
                    ref={imageCropContainerRef}
                >
                    <div className="image-crop-circle"></div>
                    <ImageZoom src={selectedAvatar} 
                        alt="selected profile image"
                        isImageCropper={true}
                        outerContainerRef={imageCropContainerRef}
                        zoomFactor={zoomFactor}
                        onZoomChange={setZoomFactor}
                    />
                </div>
                <div className="image-crop-slider-container" ref={imageCropSliderRef}>
                    <label htmlFor="avatar-zoom-slider" className="sr-only">Zoom image</label>
                    <input 
                        id="avatar-zoom-slider"
                        type="range" 
                        min="1" 
                        max="5" 
                        step="0.01" 
                        value={zoomFactor} 
                        onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
                        className="image-crop-slider"
                    />
                </div>
            </div>
            )
        }
        {errors.avatar && (
            <div className="error">{errors.avatar}</div>
        )}
        <div className="profile-avatar-container dashboard-avatar" ref={avatarContainerRef}>
            <label htmlFor="profile_image" className="hidden"
            ></label>
            <input type="file" accept=".jpg, .jpeg, .png, .webp, .bmp" name="profile_image" 
                id="profile_image" style={{ display: 'none' }} ref={fileInputRef} 
                onChange={handleFileSelect} placeholder={null}
            />    
            <button className="avatar-button"
                onClick={handleUpdateClick}   
                disabled={!user?.is_email_verified || processing} 
                type="button"
            >
                update
                <div className="image-drag-panel"></div>
            </button>
            <img src={avatar} alt={`${user?.username}'s avatar`} className="round-image" />
        </div>
        </>
    );
}

export default AvatarSetter;