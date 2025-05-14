import React, { useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs-backend-webgl";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const BulkImageBackgroundRemoverLocal = () => {
    const [images, setImages] = useState([]);
    const [processedImages, setProcessedImages] = useState([]);
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

    const removeBackgrounds = async () => {
        setLoading(true);

        // Load the BodyPix model
        const net = await bodyPix.load();

        const processed = [];

        for (const image of images) {
            const img = new Image();
            img.src = image.url;

            await new Promise((resolve) => {
                img.onload = async () => {
                    // Create a canvas element
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Perform background removal using BodyPix
                    const segmentation = await net.segmentPerson(img);

                    // Clear the canvas and apply the mask
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        // If the pixel is part of the background, make it transparent
                        if (!segmentation.data[i / 4]) {
                            data[i + 3] = 0; // Set alpha channel to 0
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);

                    // Convert the canvas to a Data URL
                    const processedUrl = canvas.toDataURL("image/png");
                    processed.push({ fileName: image.fileName, url: processedUrl });

                    resolve();
                };
            });
        }

        setProcessedImages(processed);
        setLoading(false);
    };

    const downloadAsZip = () => {
        const zip = new JSZip();

        processedImages.forEach((image) => {
            zip.file(
                image.fileName,
                fetch(image.url).then((res) => res.blob())
            );
        });

        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "processed_images.zip");
        });
    };

    return (
        <div>
            <h1>Background Remover (No API)</h1>
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
                    <button onClick={removeBackgrounds} disabled={loading}>
                        {loading ? "Processing..." : "Remove Backgrounds"}
                    </button>
                </div>
            )}
            {processedImages.length > 0 && (
                <div>
                    <h2>Processed Images:</h2>
                    {processedImages.map((image, index) => (
                        <div className="outputImages" key={index}>
                            <img
                                src={image.url}
                                alt={`Processed ${index}`}
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

export default BulkImageBackgroundRemoverLocal;