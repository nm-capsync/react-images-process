import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ImageResize from './pages/image-resize';
import ImageCrop from './pages/image-crop';
import ImageBGRemove from './pages/image-background-remove';
import Navbar from './navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ImageResize />} />
        <Route path="/image-crop" element={<ImageCrop />} />
        <Route path="/image-bg-remove" element={<ImageBGRemove />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
