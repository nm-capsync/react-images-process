import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const BulkImageCropperWithZip = () => {
    const [images, setImages] = useState([]);
    const [croppedImages, setCroppedImages] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const cropImages = async () => {
        setLoading(true);
        const cropped = [];

        for (const image of images) {
            const img = new Image();
            img.src = image.url;

            await new Promise((resolve) => {
                img.onload = () => {
                    // Define cropping dimensions
                    const cropWidth = 500; // Width of the cropped image
                    const cropHeight = 500; // Height of the cropped image
                    const centerX = img.width / 2 - cropWidth / 2;
                    const centerY = img.height / 2 - cropHeight / 2;

                    // Create a canvas to crop the image
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = cropWidth;
                    canvas.height = cropHeight;

                    // Draw the cropped portion of the image
                    ctx.drawImage(
                        img,
                        centerX,
                        centerY,
                        cropWidth,
                        cropHeight,
                        0,
                        0,
                        cropWidth,
                        cropHeight
                    );

                    // Convert the cropped image to a Data URL
                    const croppedUrl = canvas.toDataURL("image/png");
                    cropped.push({ fileName: image.fileName, url: croppedUrl });

                    resolve();
                };
            });
        }

        setCroppedImages(cropped);
        setLoading(false);
    };

    const downloadAsZip = () => {
        const zip = new JSZip();

        croppedImages.forEach((image) => {
            zip.file(
                image.fileName,
                fetch(image.url).then((res) => res.blob())
            );
        });

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "cropped_images.zip");
        });
    };

    return (
        <div>
            <h1>Image Cropper</h1>
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
                    <button onClick={cropImages} disabled={loading}>
                        {loading ? "Cropping..." : "Crop Images"}
                    </button>
                </div>
            )}
            {croppedImages.length > 0 && (
                <div>
                    <h2>Cropped Images:</h2>
                    {croppedImages.map((image, index) => (
                        <div className="outputImages" key={index}>
                            <img
                                src={image.url}
                                alt={`Cropped ${index}`}
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

export default BulkImageCropperWithZip;