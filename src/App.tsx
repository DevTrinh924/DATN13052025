import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminRoutes from './routes/admin.routes';
import UserRoutes from './routes/user.routes';
import AuthPage from './pages/user/AuthPage';
import { Provider } from 'react-redux';
import Thanhtoan from './pages/user/Thanhtoan';
import { store } from './app/store';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <AuthPage />
            </ProtectedRoute>
          } />
            <Route path="/thanhtoan" element={
              <ProtectedRoute>
                <Thanhtoan />
              </ProtectedRoute>
            } />
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly>
              <AdminRoutes />
            </ProtectedRoute>
          } />
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;