import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../features/Layoutadmin/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import Categories from '../pages/admin/Categories';
import Products from '../pages/admin/Products';
import CategorieNew from '../pages/admin/CategorieNew';
import ListNew from '../pages/admin/ListNew';
import Client from '../pages/admin/Client';
import Orders from '../pages/admin/Orders';
import CommentManagement  from '../pages/admin/Comment';
import Yeuthich from '../pages/admin/Yeuthich';
import Promotion from '../pages/admin/Promotion';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        {/* DANH MỤC & SẢN PHẨM */}
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        
        {/* TIN TỨC */}
        <Route path="categorienew" element={<CategorieNew />} />
        <Route path="listNew" element={<ListNew />} />
        
        {/* CÁC ROUTE KHÁC */}
        <Route path="orders" element={<Orders />} />
        <Route path="client" element={<Client />} />
        <Route path="commentManagement" element={<CommentManagement  />} />
        <Route path="yeuthich" element={<Yeuthich />} />
        <Route path="promotion" element={<Promotion />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;