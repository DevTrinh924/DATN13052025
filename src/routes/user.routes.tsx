import { Routes, Route } from 'react-router-dom';
import  UserLayout from '../features/Layoutuser/UserLayout';
import TrangChu from '../pages/user/Trangchu';
import Sanpham from '../pages/user/Sanpham';
import AboutUs from '../pages/user/AboutUs';
import Lienhe from '../pages/user/Lienhe';
import Tintuc from '../pages/user/Tintuc';
import Giohang from '../pages/user/Giohang';
import Sanphanct from '../pages/user/Sanphanct';
import Profile from '../pages/user/profile';
import Tintucct from '../pages/user/Tintutucct';

// import Tintucct from '../pages/user/tintuc_chitiet';

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<TrangChu />} />
        <Route path="trangchu" element={<TrangChu />} />
        <Route path="sanpham" element={<Sanpham />} />
        <Route path="/san-pham/:id" element={<Sanphanct />} />
        <Route path="aboutus" element={<AboutUs />} />
        <Route path="lienhe" element={<Lienhe />} />
        <Route path="/tin-tuc/:id" element={<Tintucct/>} />
        <Route path="tintuc" element={<Tintuc />} />
        <Route path="giohang" element={<Giohang />} />
        <Route path="profile" element={<Profile />} />
       
      </Route>
    </Routes>
  );
};

export default UserRoutes;