import React, { useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs'; // Load TensorFlow.js backend
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
const ImageBGRemove = () => {
    const [processedImages, setProcessedImages] = useState([]);

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files);
        const model = await bodyPix.load(); // Load model once
        let fileArr = [];
        const results = await Promise.all(
            files.map(async (file) => {
                // console.log(" filename :: ", file.name);

                const image = await loadImage(file);

                const mask = await model.segmentPerson(image);

                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const ctx = canvas.getContext('2d');

                // Draw original image
                ctx.drawImage(image, 0, 0);

                // Get image data and apply transparency
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                for (let i = 0; i < mask.data.length; i++) {
                    if (mask.data[i] === 0) {
                        pixels[i * 4 + 3] = 0; // Set alpha to 0 for background
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                fileArr.push({
                    name: file.name,
                    data: canvas.toDataURL('image/png'),
                });
                // console.log("kkkk :: ", canvas.toDataURL('image/png'));

                return canvas.toDataURL('image/png');
            })
        );

        console.log("fileArr :: ", fileArr);

        setProcessedImages(results);
        downloadZip(fileArr);
    };

    const downloadZip = async (base64Files) => {
        if (base64Files) {
            const zip = new JSZip();

            console.log("base64Files :: ", base64Files);

            base64Files.forEach((file) => {
                // Remove the "data:image/png;base64," prefix if present
                const cleanedBase64 = file.data.replace(/^data:image\/\w+;base64,/, '');

                zip.file(file.name, cleanedBase64, {
                    base64: true,
                    createFolders: true,
                });
            });

            // Generate the zip as a Blob
            const blob = await zip.generateAsync({ type: "blob" });

            // Trigger download
            saveAs(blob, "my_files_bg_remove.zip");
            // window.location.reload();
        }
    };


    const loadImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div>
            <h2>Bulk Background Remover (No API)</h2>
            <input type="file" multiple accept="image/*" onChange={handleFiles} />
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 20 }}>
                {processedImages.map((src, i) => (
                    <img key={i} src={src} alt="Processed" style={{ width: 200, margin: 10 }} />
                ))}
            </div>
        </div>
    );
};
export default ImageBGRemove