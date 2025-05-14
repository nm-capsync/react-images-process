import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ImageConverter = () => {
  const [images, setImages] = useState([]);
  const [convertedImages, setConvertedImages] = useState([]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.type === "image/jpeg");

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

  const convertImages = () => {
    const converted = [];
    const promises = images.map(
      (image) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = image.url;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Convert to PNG
            const pngUrl = canvas.toDataURL("image/png");
            converted.push({ fileName: image.fileName.replace(".jpg", ".png"), url: pngUrl });
            resolve();
          };
        })
    );

    Promise.all(promises).then(() => {
      setConvertedImages(converted);
    });
  };

  const downloadAsZip = () => {
    const zip = new JSZip();

    convertedImages.forEach((image) => {
      const base64Data = image.url.split(",")[1]; // Extract base64 data
      zip.file(image.fileName, base64Data, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "converted_images.zip");
    });
  };

  return (
    <div>
      <h1>JPG to PNG Converter</h1>
      <input type="file" accept="image/jpeg" multiple onChange={handleImageUpload} />
      {images.length > 0 && (
        <div>
          <h2>Uploaded JPG Images:</h2>
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Uploaded ${index}`}
              style={{ maxWidth: "200px", margin: "10px" }}
            />
          ))}
          <br />
          <button onClick={convertImages}>Convert to PNG</button>
        </div>
      )}
      {convertedImages.length > 0 && (
        <div>
          <h2>Converted PNG Images:</h2>
          {convertedImages.map((image, index) => (
            <div className="outputImages" key={index}>
              <img
                src={image.url}
                alt={`Converted ${index}`}
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

export default ImageConverter;