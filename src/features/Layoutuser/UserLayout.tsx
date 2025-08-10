import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const AdminLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

export default AdminLayout;