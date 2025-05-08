import React from 'react';
import { imageFileResizer } from "@peacechen/react-image-file-resizer";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
const ImageResize = () => {
    const resizeFile = async (files) => {
        let fileArr = [];
        for (let file of files) {
            try {
                const uri = await imageFileResizer({
                    compressFormat: file.type.split('/')[1],
                    file: file,
                    maxHeight: 800,
                    maxWidth: 800,
                    minHeight: 300,
                    minWidth: 300,
                    outputType: "base64",
                    quality: 70,
                    rotation: 0,
                });
                fileArr.push({
                    data: uri,
                    name: file.name.split('.')[0],
                    extension: file.type.split('/')[1]
                });
            } catch (err) {
                console.log(err);
            }
        }
        console.log("fileArr :: ", fileArr);

        downloadZip(fileArr);
    };

    const downloadZip = async (base64Files) => {
        if (base64Files) {
            const zip = new JSZip();
            console.log("base64Files :: ", base64Files);
            base64Files.forEach((file) => {
                // Remove the "data:image/png;base64," prefix if present
                const cleanedBase64 = file.data.replace(/^data:image\/\w+;base64,/, '');

                zip.file(`${file.name}.${file.extension}`, cleanedBase64, {
                    base64: true,
                    createFolders: true,
                });
            });

            // Generate the zip as a Blob
            const blob = await zip.generateAsync({ type: "blob" });

            // Trigger download
            saveAs(blob, "my_files.zip");
            window.location.reload();
        }
    };

    return (
        <div>
            <h1>Images Resize</h1>
            <div>
                {/* Input to upload and resize an image */}
                <input
                    multiple
                    type="file"
                    onChange={(e) => {
                        resizeFile(e.target.files);
                    }}
                />
            </div>
        </div>
    );
}

export default ImageResize