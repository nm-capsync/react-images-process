import { Link } from 'react-router-dom';

const Navbar = () => (
    <>
        <Link to="/">Images Resize</Link> | <Link to="/image-crop">Images Crop</Link> | <Link to="/image-bg-remove">Images BG Remove</Link>
    </>
);

export default Navbar