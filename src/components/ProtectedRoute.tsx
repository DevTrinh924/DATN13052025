import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/api/ClientApi';
import { getCartCount } from '../services/api/CartApi'; // Giả sử bạn có hàm này

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isCheckingCart, setIsCheckingCart] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Debug: log thông tin user
  console.log("[ProtectedRoute] User:", user);
  console.log("[ProtectedRoute] Token:", token);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          if (!response.success || !response.user) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            // Cập nhật thông tin user nếu cần
            localStorage.setItem('user', JSON.stringify(response.user));
          }
        } catch (error) {
          console.error('Lỗi xác minh mã thông báo:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    const checkCartForCheckout = async () => {
      if (location.pathname === '/thanhtoan') {
        setIsCheckingCart(true);
        try {

          // Kiểm tra nếu là mua ngay thì không cần kiểm tra giỏ hàng
            const buyNowItem = localStorage.getItem('buyNowItem');
            if (buyNowItem) {
              setIsCheckingCart(false);
              return;
            }

          // Kiểm tra cả localStorage và số lượng giỏ hàng từ API
          if (!localStorage.getItem('checkoutItems')) {
            const cartCount = await getCartCount();
            if (cartCount === 0) {
              setShouldRedirect(true);
            }
          }
        } catch (error) {
          console.error('Lỗi khi kiểm tra giỏ hàng:', error);
        } finally {
          setIsCheckingCart(false);
        }
      }
    };

    checkCartForCheckout();
  }, [location.pathname]);

  if (requireAuth) {
    if (!token || !user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.VaiTro !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } else {
    // Nếu route không yêu cầu auth nhưng user đã đăng nhập
    if (token && user) {
      return <Navigate to={user.VaiTro === 'admin' ? '/admin' : '/'} replace />;
    }
  }

  // Kiểm tra và chuyển hướng nếu giỏ hàng trống khi vào trang thanh toán
  if (!isCheckingCart && shouldRedirect) {
    return <Navigate to="/giohang" replace />;
  }

  return children;
};

export default ProtectedRoute;


// import { useEffect } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { getCurrentUser } from '../services/api/ClientApi';
// import { getCartCount } from '../services/api/CartApi'; // Giả sử bạn có hàm này
// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   adminOnly?: boolean;
//   requireAuth?: boolean;
// }

// const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }: ProtectedRouteProps) => {
//   const location = useLocation();
//   const token = localStorage.getItem('token');
//   const user = JSON.parse(localStorage.getItem('user') || 'null');
//   // Debug: log thông tin user
//   console.log("[ProtectedRoute] User:", user);
//   console.log("[ProtectedRoute] Token:", token);
// // ProtectedRoute.tsx
// useEffect(() => {
//   const verifyToken = async () => {
//     if (token) {
//       try {
//         const response = await getCurrentUser(token);
//         if (!response.success || !response.user) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//         } else {
//           // Cập nhật thông tin user nếu cần
//           localStorage.setItem('user', JSON.stringify(response.user));
//         }
//       } catch (error) {
//         console.error('Lỗi xác minh mã thông báo:', error);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//       }
//     }
//   };

//   verifyToken();
// }, [token]);
//   if (requireAuth) {
//     if (!token || !user) {
//       return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     if (adminOnly && user.VaiTro !== 'admin') {
//       return <Navigate to="/" replace />;
//     }
//   } else {
//     // Nếu route không yêu cầu auth nhưng user đã đăng nhập
//     if (token && user) {
//       return <Navigate to={user.VaiTro === 'admin' ? '/admin' : '/'} replace />;
//     }
//   }

//   return children;
// };

// export default ProtectedRoute;