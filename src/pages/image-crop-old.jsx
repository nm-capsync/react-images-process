import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function getCroppedImg(imageSrc, crop, fileName) {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            canvas.width = crop.width;
            canvas.height = crop.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height
            );

            canvas.toBlob((blob) => {
                resolve({ blob, fileName });
            }, 'image/jpeg');
        };
    });
}

export default function BulkImageCropper() {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreas, setCroppedAreas] = useState([]);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        const newAreas = [...croppedAreas];
        newAreas[currentIndex] = croppedAreaPixels;
        setCroppedAreas(newAreas);
    }, [croppedAreas, currentIndex]);

    const handleFiles = (e) => {
        const files = Array.from(e.target.files).map((file) => ({
            src: URL.createObjectURL(file),
            name: file.name
        }));
        setImages(files);
        setCroppedAreas(Array(files.length).fill(null));
    };

    const downloadAll = async () => {
        const zip = new JSZip();

        for (let i = 0; i < images.length; i++) {
            const { blob, fileName } = await getCroppedImg(images[i].src, croppedAreas[0], images[i].name);
            zip.file(`${fileName}`, blob);
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'cropped_images.zip');
        });
    };

    return (
        <div>
            <h1>Images Crop</h1>
            <input type="file" accept="image/*" multiple onChange={handleFiles} />
            {images.length > 0 && (
                <>
                    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
                        <Cropper
                            image={images[currentIndex].src}
                            crop={crop}
                            zoom={zoom}
                            aspect={4 / 3}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <div>
                        <button onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}>Previous</button>
                        <button onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1))}>Next</button>
                        <button onClick={downloadAll}>Download Cropped Images (ZIP)</button>
                    </div>
                </>
            )}
        </div>
    );
}
