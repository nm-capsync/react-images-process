import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const BulkImageResizerWithZip = () => {
    const [images, setImages] = useState([]);
    const [resizedImages, setResizedImages] = useState([]);

    // Handle image upload
    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter((file) =>
            ["image/jpeg", "image/png"].includes(file.type)
        );

        const imagePromises = validFiles.map(
            (file) =>
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({ fileName: file.name, url: e.target.result });
                    };
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(imagePromises).then((images) => {
            setImages(images);
        });
    };

    // Resize images
    const resizeImages = () => {
        const resized = [];
        const promises = images.map(
            (image) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.src = image.url;
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");

                        // Set new dimensions (e.g., maximum size 300x300 while maintaining aspect ratio)
                        const maxWidth = 300;
                        const maxHeight = 300;
                        let { width, height } = img;

                        if (width > maxWidth || height > maxHeight) {
                            if (width > height) {
                                height = (height * maxWidth) / width;
                                width = maxWidth;
                            } else {
                                width = (width * maxHeight) / height;
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw the resized image on the canvas
                        ctx.drawImage(img, 0, 0, width, height);

                        // Export the resized image as a Data URL
                        const resizedUrl = canvas.toDataURL(img.src.includes("image/png") ? "image/png" : "image/jpeg");
                        resized.push({ fileName: image.fileName, url: resizedUrl });
                        resolve();
                    };
                })
        );

        Promise.all(promises).then(() => {
            setResizedImages(resized);
        });
    };

    // Download resized images as a ZIP file
    const downloadAsZip = () => {
        const zip = new JSZip();

        resizedImages.forEach((image) => {
            const base64Data = image.url.split(",")[1]; // Extract base64 data
            zip.file(image.fileName, base64Data, { base64: true });
        });

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "resized_images.zip");
        });
    };

    return (
        <div>
            <h1>Bulk Image Resizer with ZIP Download</h1>
            <input
                type="file"
                accept="image/jpeg, image/png"
                multiple
                onChange={handleImageUpload}
            />
            {images.length > 0 && (
                <div>
                    <h2>Uploaded Images:</h2>
                    {images.map((image, index) => (
                        <img
                            key={index}
                            src={image.url}
                            alt={`Uploaded ${index}`}
                            style={{ maxWidth: "200px", margin: "10px" }}
                        />
                    ))}
                    <button onClick={resizeImages}>Resize Images</button>
                </div>
            )}
            {resizedImages.length > 0 && (
                <div>
                    <h2>Resized Images:</h2>
                    {resizedImages.map((image, index) => (
                        <div key={index}>
                            <img
                                src={image.url}
                                alt={`Resized ${index}`}
                                style={{ maxWidth: "200px", margin: "10px" }}
                            />
                            <p>{image.fileName}</p>
                        </div>
                    ))}
                    <button onClick={downloadAsZip}>Download as ZIP</button>
                </div>
            )}
        </div>
    );
};

export default BulkImageResizerWithZip;