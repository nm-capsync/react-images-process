import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const BulkImageCompressorWithZip = () => {
    const [images, setImages] = useState([]);
    const [compressedImages, setCompressedImages] = useState([]);

    // Handle file upload
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
                        resolve({ fileName: file.name, url: e.target.result, file });
                    };
                    reader.readAsDataURL(file);
                })
        );

        Promise.all(imagePromises).then((images) => {
            setImages(images);
        });
    };

    // Compress images
    const compressImages = async () => {
        const options = {
            maxSizeMB: 1, // Maximum size of the compressed file in MB
            maxWidthOrHeight: 800, // Max width or height of the compressed image
            useWebWorker: true, // Use web workers for better performance
        };

        const compressed = [];
        for (const image of images) {
            const compressedFile = await imageCompression(image.file, options);
            const compressedUrl = URL.createObjectURL(compressedFile);
            compressed.push({ fileName: image.fileName, url: compressedUrl });
        }

        setCompressedImages(compressed);
    };

    // Download all compressed images as a ZIP file
    const downloadAsZip = () => {
        const zip = new JSZip();

        compressedImages.forEach((image) => {
            zip.file(image.fileName, fetch(image.url).then((res) => res.blob()));
        });

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "compressed_images.zip");
        });
    };

    return (
        <div>
            <h1>Bulk Image Compressor with ZIP Download</h1>
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
                    <br />
                    <button onClick={compressImages}>Compress Images</button>
                </div>
            )}
            {compressedImages.length > 0 && (
                <div>
                    <h2>Compressed Images:</h2>
                    {compressedImages.map((image, index) => (
                        <div className="outputImages" key={index}>
                            <img
                                src={image.url}
                                alt={`Compressed ${index}`}
                                style={{ maxWidth: "200px", margin: "10px" }}
                            />
                            <p>{image.fileName}</p>
                        </div>
                    ))}
                    <br />
                    <button onClick={downloadAsZip}>Download as ZIP</button>
                </div>
            )}
        </div>
    );
};

export default BulkImageCompressorWithZip;