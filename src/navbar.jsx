import { Link } from 'react-router-dom';

const Navbar = () => (
    <>
        <Link className='menubtn' to="/">Images Compression</Link>
        <Link className='menubtn' to="/image-crop">Images Crop</Link>
        <Link className='menubtn' to="/image-bg-remove">Images BG Remove</Link>
        <Link className='menubtn' to="/image-convert">Images Convert (JPG to PNG)</Link>
    </>
);

export default Navbar