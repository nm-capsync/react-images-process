import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ImageResize from './pages/image-resize';
import ImageCrop from './pages/image-crop';
import ImageBGRemove from './pages/image-background-remove-old';
import Navbar from './navbar';
import ImageConverter from './pages/image-converter-jpgtopng';
import BulkImageResizerWithZip from './pages/image-resize-new';
import BulkImageCompressorWithZip from './pages/image-compression';
import BulkImageBackgroundRemoverLocal from './pages/image-background-remove';
import BulkImageCropperWithZip from './pages/image-crop';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/image-resize-old" element={<ImageResize />} />
        <Route path="/image-resize" element={<BulkImageResizerWithZip />} />
        <Route path="/" element={<BulkImageCompressorWithZip />} />
        <Route path="/image-crop" element={<BulkImageCropperWithZip />} />
        <Route path="/image-crop-old" element={<ImageCrop />} />
        <Route path="/image-bg-remove-old" element={<ImageBGRemove />} />
        <Route path="/image-bg-remove" element={<BulkImageBackgroundRemoverLocal />} />
        <Route path="/image-convert" element={<ImageConverter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
