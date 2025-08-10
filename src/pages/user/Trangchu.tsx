import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCategories } from "../../services/api/categoryApi";
import { getProducts } from "../../services/api/ProductsApi";
import { getNews } from "../../services/api/ListNewApi";
import { addToCart, getCartCount } from "../../services/api/CartApi";
import { getFavorites, addToWishlist, deleteFavorite } from "../../services/api/YeuthichApi";
import '../../assets/styles/user/trangchu.css';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import type { Product, News, Category, Favorite } from '../../types/models';


const Trangchu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Hàm xử lý URL hình ảnh
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
    // Nếu đã là URL đầy đủ
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return imagePath;
    }
    // Nếu bắt đầu bằng /uploads/ (đã được xử lý từ backend)
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:3000${imagePath}`;
    }
    // Trường hợp còn lại - đường dẫn tương đối
    return `http://localhost:3000/uploads/${imagePath}`;
  };
  // Hàm kiểm tra sản phẩm đã được yêu thích bởi người dùng hiện tại chưa
  const isFavorite = (productId: number) => {
    const userString = localStorage.getItem("user");
    if (!userString) return false;

    const user = JSON.parse(userString);
    return userFavorites.some(fav => fav.MaSanPham === productId && fav.MaKhachHang === user.MaKhachHang);
  };

  // Hàm thêm/xóa yêu thích
  const toggleFavorite = async (productId: number) => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
  Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập để sử dụng tính năng này",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Đóng",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return;
    }
    const user = JSON.parse(userString);

    try {
      if (isFavorite(productId)) {
        // Xóa khỏi yêu thích
        await deleteFavorite(productId, token);
        setUserFavorites(prev => prev.filter(fav => !(fav.MaSanPham === productId && fav.MaKhachHang === user.MaKhachHang)));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        // Thêm vào yêu thích
        await addToWishlist(user.MaKhachHang, productId, token);

        const product = products.find(p => p.MaSanPham === productId);
        const category = categories.find(c => c.MaDanMuc === product?.MaDanMuc);

        if (product) {
          const newFavorite: Favorite = {
            MaKhachHang: user.MaKhachHang,
            MaSanPham: productId,
            HoTen: user.HoTen,
            TenSanPham: product.TenSanPham,
            Gia: product.Gia,
            Hinh: product.Hinh,
            TenDanMuc: category?.TenDanMuc || '',
            NgayThem: new Date().toISOString(),
            avatar: user.avatar
          };

          setUserFavorites(prev => [...prev, newFavorite]);
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      }
    } catch (error) {
      toast.error("Lỗi khi thao tác yêu thích");
      console.error("Error toggling favorite:", error);
    }
  };

  // Hàm thêm vào giỏ hàng
const addToCartHandler = async (productId: number, size: string ="", quantity: number = 1) => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({
      title: 'Thông báo',
      text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
      icon: 'warning',
      confirmButtonText: 'Đóng'
    });
    return;
  }

  try {
    const product = products.find(p => p.MaSanPham === productId);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    const response = await addToCart({
      MaSanPham: productId,
      TenSanPham: product.TenSanPham,
      Gia: product.Gia,
      Hinh: product.Hinh,
      SoLuong: quantity,
      Size: size
    });
    
    if (response.success) {
      // Cập nhật số lượng giỏ hàng
      const count = await getCartCount();
      setCartCount(count);
      
      Swal.fire({
        title: 'Thành công',
        text: 'Đã thêm sản phẩm vào giỏ hàng',
        icon: 'success',
        confirmButtonText: 'Đóng'
      });
    } else {
      throw new Error(response.message || 'Lỗi khi thêm vào giỏ hàng');
    }
  } catch (error: any) {
    Swal.fire({
      title: 'Lỗi',
      text: error.message || 'Lỗi khi thêm vào giỏ hàng',
      icon: 'error',
      confirmButtonText: 'Đóng'
    });
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
  }
};
  // Hàm fetch dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";

      const [categoriesData, productsData, newsData, favoritesData] = await Promise.all([
        getCategories(),
        getProducts(),
        getNews(),
        token ? getFavorites(token) : Promise.resolve([])
      ]);

      setCategories(categoriesData);
      setProducts(productsData);
      setNews(newsData);
      setFavorites(favoritesData);
      setUserFavorites(favoritesData);

      // Lấy số lượng giỏ hàng nếu đã đăng nhập
      if (token) {
        const count = await getCartCount();
        setCartCount(count);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      import('../../assets/js/trangchu').then(module => {
        module.initSliders();
      });
    }
  }, [loading]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <>
      {/* Hero Slider */}
      <section className="hero-slider">
        <div className="slider-container" id="sliderContainer">
          <div className="slide active">
            <div
              className="slide-img"
              style={{
                backgroundImage:
                  'url("https://pos.nvncdn.com/211f76-106986/ps/20240305_kAl9JU4NfW.jpeg")'
              }}
            />
            <div className="slide-content">
              <h1>Trang sức cao cấp cho mọi dịp</h1>
              <p>
                Khám phá bộ sưu tập trang sức tinh xảo của chúng tôi, được chế tác tỉ mỉ từ những chất liệu quý giá nhất
              </p>
              <a
                href="#"
                className="btn-luxury"
                style={{ display: "flex", textAlign: "center" }}
              >
                Mua ngay
              </a>
            </div>
          </div>
          <div className="slide">
            <div
              className="slide-img"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1602173574767-37ac01994b2a")'
              }}
            />
            <div className="slide-content">
              <h1>Bộ sưu tập mới 2025</h1>
              <p>Những thiết kế độc quyền chỉ có tại 4 Dreams, mang đậm dấu ấn cá nhân</p>
              <a href="#" className="btn-luxury">
                Khám phá ngay
              </a>
            </div>
          </div>
          <div className="slide">
            <div
              className="slide-img"
              style={{
                backgroundImage:
                  'url("https://tnj.vn/17441-large_default/bong-tai-ngoc-trai-btn0110.jpg")'
              }}
            />
            <div className="slide-content">
              <h1>Giảm giá 20% mùa hè</h1>
              <p>
                Ưu đãi đặc biệt cho bộ sưu tập trang sức mùa hè 2025
              </p>
              <a href="" className="btn-luxury">
                Xem ưu đãi
              </a>
            </div>
          </div>
        </div>
        {/* Slider Controls */}
        <div className="slider-controls">
          <button id="prevSlide" title="p">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="currentColor"
              className="bi bi-chevron-left"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
              />
            </svg>
          </button>
          <button id="nextSlide" title="p">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="currentColor"
              className="bi bi-chevron-right"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
              />
            </svg>
          </button>
        </div>
        {/* Slider Indicators */}
        <div className="slider-indicators" id="sliderIndicators">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      {/* danh mục  Slider */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-title">
            <h2>Danh mục nổi bật</h2>
            <p>Khám phá các danh mục trang sức đa dạng của chúng tôi</p>
          </div>
          <div className="categories-slider">
            <div className="categories-container" id="categoriesContainer">
              {categories.map((category) => (
                <Link to="/sanpham" style={{ textDecoration: "none", color: "inherit" }} className="category-card" key={category.MaDanMuc}>
                  <div>
                    <div className="category-img">
                      <img
                        src={getImageUrl(category.hinh_dm)}
                        alt={category.TenDanMuc}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                        }}
                      />
                    </div>
                    <div className="category-overlay">
                      <h3>{category.TenDanMuc}</h3>
                      <p className="count">
                        {products.filter(p => p.MaDanMuc === category.MaDanMuc).length} sản phẩm
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="categories-nav">
              <button id="prevCategory" title="htht">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  fill="currentColor"
                  className="bi bi-chevron-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                  />
                </svg>
              </button>
              <button id="nextCategory" title="htht">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  fill="currentColor"
                  className="bi bi-chevron-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Collection Section */}
      <section className="luxury-collection">
        <div className="container">
          <div className="luxury-content">
            <h2>🎉 Giảm giá 30% cho bộ sưu tập mùa hè</h2>
            <p className="mb-4">
              Áp dụng cho tất cả sản phẩm mới. Ưu đãi đến 31/08! Thời gian có hạn.
            </p>
            <a href="#" className="btn-luxury">
              Xem ngay
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products - Favorites */}
      <section className="featured-products">
        <div className="container">
          <div className="section-title">
            <h2>Sản phẩm yêu thích</h2>
            <p>Những sản phẩm được khách hàng yêu thích nhất</p>
          </div>
          <div className="products-grid">
            {favorites.slice(0, 6).map((favorite) => (
              <div className="product-card" key={`${favorite.MaKhachHang}-${favorite.MaSanPham}`}>
                <div className="product-badge">Yêu thích</div>
                <div className="product-image">
                  <img
                    src={getImageUrl(favorite.SanPhamHinh || favorite.Hinh)}
                    alt={favorite.TenSanPham}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                      target.onerror = null;
                    }}
                  />
                  <div className="product-actionssp">
                    <button
                      className="action-btn"
                      title="Yêu thích"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(favorite.MaSanPham);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill={isFavorite(favorite.MaSanPham) ? "#ff0000" : "currentColor"}
                        className="bi bi-heart-fill"
                        viewBox="0 0 16 16"
                      >
                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
                      </svg>
                    </button>

                    <button
                      className="action-btn"
                      title="Thêm vào giỏ"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCartHandler(favorite.MaSanPham);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-bag-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <span className="product-category">{favorite.TenDanMuc}</span>
                  <h3 className="product-title">
                    <Link to={`/san-pham/${favorite.MaSanPham}`}>{favorite.TenSanPham}</Link>
                  </h3>
                  <div className="product-price">
                    <span className="current-price">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(favorite.Gia || 0)}
                    </span>
                  </div>
                  <div className="product-meta">
                    <span className="product-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
                          fill="currentColor"
                          className="bi bi-star-fill"
                          viewBox="0 0 16 16"
                        >
                          <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/sanpham" className="botbon">
              Xem thêm
            </Link>
          </div>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="container">
          <div className="section-title">
            <h2>Đánh giá từ khách hàng</h2>
            <p>Những cảm nhận của khách hàng về sản phẩm của chúng tôi</p>
          </div>
          <div className="testimonial-content">
            <div className="testimonial-card">
              <p className="testimonial-text">
                "Chất lượng nhẫn đính hôn vượt quá mong đợi của tôi. Sự chú ý đến từng chi tiết thật đáng kinh ngạc, và viên kim cương lấp lánh như chưa từng thấy. Jewelry Shop thực sự tạo ra những tác phẩm đẳng cấp."
              </p>
              <div className="testimonial-author">
                <h4>Nguyễn Thị A</h4>
                <p>Khách hàng từ năm 2018</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="new-products">
        <div className="container">
          <div className="section-title">
            <h2>Sản phẩm mới</h2>
            <p>Khám phá những thiết kế mới nhất của chúng tôi</p>
          </div>
          <div className="products-grid">
            {products.slice(0, 6).map((product) => (
              <div className="product-card" key={product.MaSanPham}>
                <div className="product-badge">Mới</div>
                <div className="product-image">
                  <img
                    src={getImageUrl(product.Hinh)}
                    alt={product.TenSanPham}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                      target.onerror = null;
                    }}
                    loading="lazy"
                  />
                  <div className="product-actionssp">
                    <button
                      className="action-btn"
                      title="Yêu thích"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(product.MaSanPham);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill={isFavorite(product.MaSanPham) ? "#ff0000" : "currentColor"}
                        className="bi bi-heart-fill"
                        viewBox="0 0 16 16"
                      >
                        <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314" />
                      </svg>
                    </button>
                    <button
                      className="action-btn"
                      title="Thêm vào giỏ"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCartHandler(product.MaSanPham);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-bag-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <Link to={`/san-pham/${product.MaSanPham}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="product-info">
                    <span className="product-category">{categories.find(c => c.MaDanMuc === product.MaDanMuc)?.TenDanMuc || 'Uncategorized'}</span>
                    <h3 className="product-title">
                      {product.TenSanPham}
                    </h3>
                    <div className="product-price">
                      <span className="current-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.Gia)}
                      </span>
                    </div>
                    <div className="product-meta">
                      <span className="product-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            fill="currentColor"
                            className="bi bi-star-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                          </svg>
                        ))}
                      </span>
                      <span>Đã bán: {Math.floor(Math.random() * 100)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/sanpham" className="botbon">
              Xem thêm
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="news-section">
        <div className="container">
          <div className="section-title">
            <h2>Tin tức &amp; Tạp chí</h2>
            <p>Cập nhật những xu hướng và kiến thức mới nhất về trang sức</p>
          </div>
          <div className="news-container">
            <div className="main-news">
              {news.length > 0 && (
                <>
                  <div className="featured-news">
                    <div className="featured-news-img">
                      <img
                        src={news[0].Hinh || "https://images.unsplash.com/photo-1605100804763-247f67b3557e"}
                        alt={news[0].TieuDe}
                      />
                    </div>
                    <div className="featured-news-content">
                      <div className="featured-news-date">
                        {new Date().toLocaleDateString()}
                      </div>
                      <h3 className="featured-news-title">
                        {news[0].TieuDe}
                      </h3>
                      <p className="featured-news-excerpt">
                        {news[0].MoTaNgan}
                      </p>
                      <a href={`/tin-tuc/${news[0].MaTinTuc}`} className="read-more">
                        Xem chi tiết
                      </a>
                    </div>
                  </div>
                  <div className="secondary-news">
                    {news.slice(1, 3).map((item) => (
                      <div className="secondary-news-item" key={item.MaTinTuc}>
                        <div className="secondary-news-img">
                          <img
                            src={item.Hinh || "https://images.unsplash.com/photo-1605100804763-247f67b3557e"}
                            alt={item.TieuDe}
                          />
                        </div>
                        <div className="secondary-news-content">
                          <div className="secondary-news-date">
                            {new Date().toLocaleDateString()}
                          </div>
                          <h4 className="secondary-news-title">
                            {item.TieuDe}
                          </h4>
                          <a href={`/tin-tuc/${item.MaTinTuc}`} className="read-more">
                            Đọc tiếp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="news-list">
              {news.slice(3, 6).map((item) => (
                <div className="news-list-item" key={item.MaTinTuc}>
                  <div className="news-list-img">
                    <img
                      src={item.Hinh || "https://images.unsplash.com/photo-1605100804763-247f67b3557e"}
                      alt={item.TieuDe}
                    />
                  </div>
                  <div className="news-list-content">
                    <div className="news-list-date">
                      {new Date().toLocaleDateString()}
                    </div>
                    <h4 className="news-list-title">
                      {item.TieuDe}
                    </h4>
                    <p className="news-list-excerpt">
                      {item.MoTaNgan}
                    </p>
                    <a href={`/tintuc/${item.MaTinTuc}`} className="read-more">
                      Đọc tiếp
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all">
              <a href="/tintuc">Xem tất cả tin tức</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Trangchu;