import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../assets/styles/user/profile.css';


// Thêm interface Review
interface Review {
  MaDanhGia: number;
  TenSanPham: string;
  SoSao: number;
  BinhLuan: string;
  NgayDanhGia: string;
  TrangThai: string;
  MaSanPham: number;
  Hinh: string;
}

interface Client {
  HoTen: string;
  Email: string;
  SoDienThoai?: string;
  DiaChi?: string;
  avatar?: string;
  VaiTro: string;
  MaKhachHang: number;
  reviews?: Review[];
}

interface FormDataType {
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  DiaChi: string;
  avatar: string | File | null;
  avatarPreview: string;
}

interface PasswordFormType {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Order {
  MaDonHang: number;
  NgayDat: string;
  TongTien: number;
  TrangThai: string;
  PhuongThucThanhToan: string;
  TrangThaiThanhToan: string;
  DiaChiGiaoHang: string;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  MaKhachHang: number;
}

interface OrderDetailItem {
  TenSanPham: string;
  SoLuong: number;
  GiaTien: number;
  Size: string;
  Hinh: string;
}

interface OrderDetails extends Order {
  chiTiet: OrderDetailItem[];
}

interface Favorite {
  MaKhachHang: number;
  MaSanPham: number;
  TenSanPham: string;
  Gia: number;
  Hinh: string;
  SanPhamHinh?: string;
}

const Profile = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('personal-info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    DiaChi: '',
    avatar: null,
    avatarPreview: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormType>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Hàm xử lý URL hình ảnh
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return imagePath;
    }
    return `http://localhost:3000${imagePath.startsWith('/uploads/') ? imagePath : `/uploads/${imagePath}`}`;
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserReviews();
    fetchUserData();
    fetchUserOrders();
  }, [token, navigate]);


  const fetchUserData = async () => {
    try {
      setLoading(true);

      const userResponse = await axios.get('http://localhost:3000/api/client/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (userResponse.data.success && userResponse.data.user) {
        const userData = userResponse.data.user;
        setUser(userData);

        setFormData({
          HoTen: userData.HoTen,
          Email: userData.Email,
          SoDienThoai: userData.SoDienThoai || '',
          DiaChi: userData.DiaChi || '',
          avatar: null,
          avatarPreview: userData.avatar ? getImageUrl(userData.avatar) : 'https://via.placeholder.com/150'
        });

        // Lấy danh sách yêu thích
        await fetchFavorites();
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể tải dữ liệu người dùng. Vui lòng đăng nhập lại.',
        icon: 'error'
      }).then(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách yêu thích
  const fetchFavorites = async () => {
    try {
      if (!token) return;

      // Lấy thông tin user từ localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData?.MaKhachHang) return;

      const response = await axios.get(`http://localhost:3000/api/yeuthich`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Lọc chỉ lấy sản phẩm yêu thích của user hiện tại
      const userFavorites = response.data.data.filter((fav: Favorite) =>
        fav.MaKhachHang === userData.MaKhachHang
      );

      setFavorites(userFavorites.map((fav: Favorite) => ({
        ...fav,
        Hinh: getImageUrl(fav.Hinh || fav.SanPhamHinh)
      })));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu thích:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách yêu thích', 'error');
    }
  };

  const fetchUserOrders = async () => {
    try {
      if (!user) return;
      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { customerName: user.HoTen }
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách đơn hàng', 'error');
    }
  };


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedOrder(null);
    setOrderDetails(null);
    if (tab === 'wishlist') {
      fetchFavorites(); // Tải lại danh sách yêu thích khi chuyển tab
    }
  };


  // Trong Profile.tsx - Xử lý thêm vào giỏ hàng từ danh sách yêu thích
  const handleAddToCart = async (productId: number) => {
    if (!token) {
      Swal.fire('Thông báo', 'Vui lòng đăng nhập để thêm vào giỏ hàng', 'info');
      return;
    }

    try {
      const favorite = favorites.find(fav => fav.MaSanPham === productId);
      if (!favorite) {
        throw new Error('Không tìm thấy sản phẩm trong danh sách yêu thích');
      }

      const response = await axios.post(
        'http://localhost:3000/api/cart',
        {
          MaSanPham: productId,
          TenSanPham: favorite.TenSanPham,
          Gia: favorite.Gia,
          Hinh: favorite.Hinh.replace('http://localhost:3000', ''),
          SoLuong: 1,
          Size: 'M'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Swal.fire('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng', 'success');
      } else {
        throw new Error(response.data.message || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (error: any) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Swal.fire('Lỗi', error.message || 'Không thể thêm sản phẩm vào giỏ hàng', 'error');
    }
  };

  // Xóa sản phẩm khỏi danh sách yêu thích
  const handleRemoveFavorite = async (productId: number) => {
    if (!token) {
      Swal.fire('Thông báo', 'Vui lòng đăng nhập để thực hiện thao tác này', 'info');
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:3000/api/yeuthich/product/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Cập nhật danh sách yêu thích sau khi xóa
          setFavorites(favorites.filter(fav => fav.MaSanPham !== productId));

          Swal.fire('Thành công', 'Đã xóa sản phẩm khỏi danh sách yêu thích', 'success');
        } catch (error) {
          console.error('Lỗi khi xóa sản phẩm yêu thích:', error);
          Swal.fire('Lỗi', 'Không thể xóa sản phẩm khỏi danh sách yêu thích', 'error');
        }
      }
    });
  };


  // Hàm lấy đánh giá của người dùng
  const fetchUserReviews = async () => {
    try {
      if (!token) return;

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData?.MaKhachHang) return;

      const response = await axios.get(`http://localhost:3000/api/comment`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Lọc chỉ lấy đánh giá của user hiện tại
      const userReviews = response.data.filter((review: any) =>
        review.MaKhachHang === userData.MaKhachHang
      );

      // Thêm hình ảnh sản phẩm vào mỗi đánh giá
      const reviewsWithImages = await Promise.all(
        userReviews.map(async (review: any) => {
          try {
            const productResponse = await axios.get(`http://localhost:3000/api/products/${review.MaSanPham}`);
            return {
              ...review,
              Hinh: productResponse.data.Hinh ? getImageUrl(productResponse.data.Hinh) : '/default-product.jpg'
            };
          } catch (error) {
            return {
              ...review,
              Hinh: '/default-product.jpg'
            };
          }
        })
      );

      setReviews(reviewsWithImages);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đánh giá:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách đánh giá', 'error');
    }
  };



  // Hàm xóa đánh giá
  const handleDeleteReview = async (reviewId: number) => {
    Swal.fire({
      title: 'Bạn có chắc muốn xóa đánh giá này?',
      text: "Bạn sẽ không thể hoàn tác lại thao tác này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa đánh giá',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/comment/${reviewId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setReviews(reviews.filter(review => review.MaDanhGia !== reviewId));

          Swal.fire(
            'Đã xóa!',
            'Đánh giá của bạn đã được xóa.',
            'success'
          );
        } catch (error) {
          console.error('Lỗi khi xóa đánh giá:', error);
          Swal.fire(
            'Lỗi!',
            'Đã xảy ra lỗi khi xóa đánh giá.',
            'error'
          );
        }
      }
    });
  };

  // Hàm hiển thị sao đánh giá
  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            fill={star <= rating ? '#D4AF37' : '#ddd'}
            className="bi bi-star-fill"
            viewBox="0 0 16 16"
          >
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
          </svg>
        ))}
      </div>
    );
  };
const getReviewStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối'
  };
  return statusLabels[status] || status;
};

const getReviewStatusClass = (status: string) => {
  const statusClasses: Record<string, string> = {
    'cho_duyet': 'status-cho_duyet',
    'da_duyet': 'status-da_duyet',
    'tu_choi': 'status-tu_choi'
  };
  return statusClasses[status] || '';
};




  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setFormData({
            ...formData,
            avatar: file,
            avatarPreview: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      avatar: null,
      avatarPreview: user?.avatar ? getImageUrl(user.avatar) : 'https://via.placeholder.com/150'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('HoTen', formData.HoTen);
      formDataToSend.append('Email', formData.Email);
      formDataToSend.append('SoDienThoai', formData.SoDienThoai);
      formDataToSend.append('DiaChi', formData.DiaChi);

      if (formData.avatar instanceof File) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await axios.put(
        `http://localhost:3000/api/client/${user.MaKhachHang}`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data) {
        Swal.fire('Thành công', 'Cập nhật thông tin thành công', 'success');
        setEditing(false);
        fetchUserData();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin', 'error');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire('Lỗi', 'Mật khẩu mới và xác nhận không khớp', 'error');
      return;
    }

    if (!token || !user) return;

    try {
      const response = await axios.put(
        `http://localhost:3000/api/client/${user.MaKhachHang}`,
        { MatKhau: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        Swal.fire('Thành công', 'Đổi mật khẩu thành công', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi đổi mật khẩu', 'error');
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const details = response.data.data;
      setOrderDetails({
        ...details,
        chiTiet: details.chiTiet.map((item: OrderDetailItem) => ({
          ...item,
          Hinh: getImageUrl(item.Hinh)
        }))
      });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      Swal.fire('Lỗi', 'Không thể tải chi tiết đơn hàng', 'error');
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetails(null);
    fetchOrderDetails(order.MaDonHang);
  };

  const handleCancelOrder = async (orderId: number, status: string) => {
    if (status !== 'cho_xac_nhan') {
      Swal.fire('Thông báo', 'Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"', 'info');
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc muốn hủy đơn hàng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có',
      cancelButtonText: 'Không'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `http://localhost:3000/api/orders/${orderId}/status`,
            { newStatus: 'da_huy' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          Swal.fire('Thành công', 'Đã hủy đơn hàng', 'success');
          fetchUserOrders();
          if (selectedOrder?.MaDonHang === orderId) {
            setSelectedOrder({ ...selectedOrder, TrangThai: 'da_huy' });
            setOrderDetails({ ...orderDetails!, TrangThai: 'da_huy' });
          }
        } catch (error) {
          console.error('Lỗi khi hủy đơn hàng:', error);
          Swal.fire('Lỗi', 'Không thể hủy đơn hàng', 'error');
        }
      }
    });
  };



  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'cho_xac_nhan': 'Chờ xác nhận',
      'da_xac_nhan': 'Đã xác nhận',
      'dang_giao': 'Đang giao',
      'da_giao': 'Đã giao',
      'da_huy': 'Đã hủy'
    };
    return statusLabels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      'cho_xac_nhan': 'status-cho_xac_nhan',
      'da_xac_nhan': 'status-da_xac_nhan',
      'dang_giao': 'status-dang_giao',
      'da_giao': 'status-da_giao',
      'da_huy': 'status-da_huy'
    };
    return statusClasses[status] || '';
  };




  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-danger">
        Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }


  return (
    <section className="product-page">
      <div className="container">
        <div className="breadcrumb">
          <a href="/">Trang chủ</a>
          <span>/</span>
          <a href="#" className="active">Trang thông tin</a>
        </div>
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-info">
              <img
                src={formData.avatarPreview}
                alt="Avatar"
                className="profile-avatar"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
              />
              <h3 className="profile-name">{user.HoTen}</h3>
              <p className="profile-email">{user.Email}</p>
              <span className="profile-role">{user.VaiTro === 'admin' ? 'Quản trị viên' : 'Thành viên'}</span>
            </div>
            <ul className="profile-menu">
              <li>
                <a
                  href="#personal-info"
                  className={activeTab === 'personal-info' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleTabChange('personal-info'); }}
                >
                  <i className="fas fa-user" /> Thông tin cá nhân
                </a>
              </li>
              <li>
                <a
                  href="#orders"
                  className={activeTab === 'orders' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleTabChange('orders'); fetchUserOrders(); }}
                >
                  <i className="fas fa-shopping-bag" /> Đơn hàng của tôi
                </a>
              </li>
              <li>
                <a
                  href="#wishlist"
                  className={activeTab === 'wishlist' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleTabChange('wishlist'); }}
                >
                  <i className="fas fa-heart" /> Sản phẩm yêu thích
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  className={activeTab === 'reviews' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleTabChange('reviews'); }}
                >
                  <i className="fas fa-star" /> Đánh giá của tôi
                </a>
              </li>
              {user.VaiTro === 'admin' && (
                <li>
                  <a href="/admin">
                    <i className="fas fa-tools" /> Quản lý admin
                  </a>
                </li>
              )}
              <li>
                <a
                  href="#change-password"
                  className={activeTab === 'change-password' ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleTabChange('change-password'); }}
                >
                  <i className="fas fa-lock" /> Đổi mật khẩu
                </a>
              </li>
              <li>
                <a href="#" onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}>
                  <i className="fas fa-sign-out-alt" /> Đăng xuất
                </a>
              </li>
            </ul>
          </div>

          <div className="profile-content">
            {activeTab === 'personal-info' && (
              <div className="profile-tab active" id="personal-info">
                <div className="profile-header">
                  <h2 className="profile-title">Thông tin cá nhân</h2>
                  {!editing && (
                    <button className="edit-btn" onClick={handleEditProfile}>
                      <i className="fas fa-edit" /> Chỉnh sửa
                    </button>
                  )}
                </div>
                <div className="profile-img" style={{ width: "100%", textAlign: "center", marginBottom: 12 }}>
                  {editing && (
                    <div className="form-group">
                      <div className="image-upload2" id="imageUpload">
                        <input
                          type="file"
                          id="avatarInput"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="avatarInput" style={{ cursor: 'pointer' }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0"
                            />
                          </svg>
                          <p>Thay đổi avatar</p>
                        </label>
                      </div>
                      {formData.avatarPreview && (
                        <div className="image-preview3" id="imagePreview">
                          <img
                            src={formData.avatarPreview}
                            alt="Preview"
                            className="preview-image3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={handleRemoveImage}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                            </svg>
                            Xóa ảnh
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <form className="profile-form" onSubmit={handleSaveProfile}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullname">Họ và tên</label>
                      <input
                        type="text"
                        id="fullname"
                        name="HoTen"
                        value={formData.HoTen}
                        onChange={handleInputChange}
                        readOnly={!editing}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        readOnly={!editing}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="SoDienThoai"
                      value={formData.SoDienThoai}
                      onChange={handleInputChange}
                      readOnly={!editing}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Địa chỉ</label>
                    <textarea
                      id="address"
                      name="DiaChi"
                      rows={3}
                      value={formData.DiaChi}
                      onChange={handleInputChange}
                      readOnly={!editing}
                    />
                  </div>
                  {editing && (
                    <div className="form-actions">
                      <button type="submit" className="save-btn">Lưu thay đổi</button>
                      <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Hủy bỏ</button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="profile-tab" id="orders">
                <div className="profile-header">
                  <h2 className="profile-title">Đơn hàng của tôi</h2>
                </div>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-box-open"></i>
                    <p>Bạn chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.MaDonHang}>
                              <td>#{order.MaDonHang}</td>
                              <td>{formatDate(order.NgayDat)}</td>
                              <td className="vnd">{formatCurrency(order.TongTien)}</td>
                              <td>
                                <span className={`order-status ${getStatusClass(order.TrangThai)}`}>
                                  {getStatusLabel(order.TrangThai)}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="view"
                                  title="Xem chi tiết"
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                  </svg>
                                </button>
                                {order.TrangThai === 'cho_xac_nhan' && (
                                  <button
                                    className="delete"
                                    title="Hủy đơn"
                                    onClick={() => handleCancelOrder(order.MaDonHang, order.TrangThai)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={16}
                                      height={16}
                                      fill="currentColor"
                                      className="bi bi-x-octagon-fill"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 .708-.708" />
                                    </svg>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {selectedOrder && (
                      <div id={`order-detail-${selectedOrder.MaDonHang}`} className="order-details">
                        <div className="order-details-header">
                          <h3>Chi tiết đơn hàng #{selectedOrder.MaDonHang}</h3>
                          <button className="close-details-btn" onClick={() => setSelectedOrder(null)}>
                            <i className="fas fa-times"></i> Đóng
                          </button>
                        </div>
                        <div className="order-info">
                          <div className="order-info-row">
                            <span className="order-info-label">Ngày đặt:</span>
                            <span className="order-info-value">{formatDate(selectedOrder.NgayDat)}</span>
                          </div>
                          <div className="order-info-row">
                            <span className="order-info-label">Trạng thái:</span>
                            <span className={`order-status ${getStatusClass(selectedOrder.TrangThai)}`}>
                              {getStatusLabel(selectedOrder.TrangThai)}
                            </span>
                          </div>
                          <div className="order-info-row">
                            <span className="order-info-label">Phương thức thanh toán:</span>
                            <span className="order-info-value">
                              {selectedOrder.PhuongThucThanhToan === 'COD' ? 'Thanh toán khi nhận hàng' :
                                selectedOrder.PhuongThucThanhToan === 'ChuyenKhoan' ? 'Chuyển khoản' : 'Ví điện tử'}
                            </span>
                          </div>
                          <div className="order-info-row">
                            <span className="order-info-label">Trạng thái thanh toán:</span>
                            <span className="order-info-value">
                              {selectedOrder.TrangThaiThanhToan === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                          </div>
                          <div className="order-info-row">
                            <span className="order-info-label">Địa chỉ giao hàng:</span>
                            <span className="order-info-value">{selectedOrder.DiaChiGiaoHang}</span>
                          </div>
                          <div className="order-info-row">
                            <span className="order-info-label">Người nhận:</span>
                            <span className="order-info-value">{selectedOrder.TenNguoiNhan} - {selectedOrder.SoDienThoaiNhan}</span>
                          </div>
                        </div>
                        {orderDetails ? (
                          <>
                            <h4 className="order-items-title">Sản phẩm đã đặt</h4>
                            <div className="order-items">
                              {orderDetails.chiTiet.map((item, index) => (
                                <div className="order-item" key={index}>
                                  <img
                                    className="order-item-img"
                                    src={item.Hinh}
                                    alt={item.TenSanPham}
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-product.jpg'; }}
                                  />
                                  <div className="order-item-info">
                                    <h4 className="order-item-name">{item.TenSanPham}</h4>
                                    <div className="order-item-meta">
                                      <span>Size: {item.Size || 'Không có'}</span>
                                      <span>Số lượng: {item.SoLuong}</span>
                                    </div>
                                  </div>
                                  <div className="order-item-price vnd">{formatCurrency(item.GiaTien)}</div>
                                </div>
                              ))}
                            </div>
                            <div className="order-summary">
                              <div className="order-summary-row">
                                <span>Tạm tính:</span>
                                <span className="vnd">{formatCurrency(orderDetails.TongTien)}</span>
                              </div>
                              <div className="order-summary-row">
                                <span>Phí vận chuyển:</span>
                                <span className="vnd">0₫</span>
                              </div>
                              <div className="order-summary-row">
                                <span>Giảm giá:</span>
                                <span className="vnd">0₫</span>
                              </div>
                              <div className="order-summary-row order-summary-total">
                                <span>Tổng cộng:</span>
                                <span className="vnd">{formatCurrency(orderDetails.TongTien)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="loading-details">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p>Đang tải chi tiết đơn hàng...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="profile-tab" id="wishlist">
                <div className="profile-header">
                  <h2 className="profile-title">Sản phẩm yêu thích</h2>
                </div>
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-heart-broken"></i>
                    <p>Bạn chưa có sản phẩm yêu thích nào</p>
                    <a href="/sanpham" className="btn btn-primary">Xem sản phẩm</a>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {favorites.map(fav => (
                      <div className="wishlist-item" key={`${fav.MaKhachHang}-${fav.MaSanPham}`}>
                        <div className="wishlist-img">
                          <img
                            src={fav.Hinh}
                            alt={fav.TenSanPham}
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                          />
                        </div>
                        <div className="wishlist-info">
                          <h3 className="wishlist-name">{fav.TenSanPham}</h3>
                          <div className="wishlist-price vnd">{formatCurrency(fav.Gia)}</div>
                          <div className="wishlist-actions">
                            <button
                              className="wishlist-btn"
                              onClick={() => handleAddToCart(fav.MaSanPham)}
                            >
                              <i className="fas fa-shopping-cart"></i> Thêm vào giỏ
                            </button>
                            <button
                              className="wishlist-btn remove-btn"
                              onClick={() => handleRemoveFavorite(fav.MaSanPham)}
                            >
                              <i className="fas fa-trash-alt"></i> Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="profile-tab" id="reviews">
                <div className="profile-header">
                  <h2 className="profile-title">Đánh giá của tôi</h2>
                </div>
                {reviews.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-comment-alt"></i>
                    <p>Bạn chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <div className="reviews1">
                    {reviews.map((review) => (
                      <div className="review-item1" key={review.MaDanhGia}>
                        <div className="review-header">
                          <div className="review-product-info">
                            <img
                              src={review.Hinh}
                              alt={review.TenSanPham}
                              className="review-product-image"
                              style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/default-product.jpg'; }}
                            />
                              <span>
                                <a  href={`/sanpham/${review.MaSanPham}`}  className="review-product-name" style={{ fontWeight: '500', color: '#333' }} > {review.TenSanPham}</a>
                                  {renderStars(review.SoSao)}
                              </span>
                          </div>
                          <div className="review-date">
                            {formatDate(review.NgayDanhGia)}
                             <div className="review-date1">
                            <span className={`review-status ${getReviewStatusClass(review.TrangThai)}`}>
                              {getReviewStatusLabel(review.TrangThai)}
                            </span>
                          </div>
                          </div>
                           <div className="review-footer">
                          <button title='XOA' className="delete-review-btn"
                            onClick={() => handleDeleteReview(review.MaDanhGia)}
                          >
                           <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={16}
                                height={16}
                                fill="currentColor"
                                className="bi bi-x-octagon-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353zm-6.106 4.5L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
                              </svg>

                          </button>
                        </div>
                        </div>
                        <div className="review-content">
                          <p>{review.BinhLuan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'change-password' && (
              <div className="profile-tab" id="change-password">
                <div className="profile-header">
                  <h2 className="profile-title">Đổi mật khẩu</h2>
                </div>
                <form className="profile-form" onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label htmlFor="current-password">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      id="current-password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-password">Mật khẩu mới</label>
                    <input
                      type="password"
                      id="new-password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="save-btn">Đổi mật khẩu</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;