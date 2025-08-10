import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../../services/api/ProductsApi';
import { formatPrice } from '../../utils/formatPrice';
import { addToCart, getCartCount } from '../../services/api/CartApi';
import { addToWishlist, deleteFavorite, getFavorites } from '../../services/api/YeuthichApi';
import Swal from 'sweetalert2';
import '../../assets/styles/user/sanpham_chitiet.css';
import type { Product } from '../../types/models';

interface Review {
  MaDanhGia: number;
  SoSao: number;
  BinhLuan: string;
  NgayDanhGia: string;
  HoTen: string;
  avatar: string;
  TrangThai: string;
}

const Sanphanct = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(Number(id));
        setProduct(productData);

        // Parse sizes
        if (productData.Size) {
          const sizeArray = productData.Size.split(',').map(s => s.trim());
          setSizes(sizeArray);
          if (sizeArray.length > 0) {
            setSelectedSize(sizeArray[0]);
          }
        }

        // Fetch all products for related items
        const allProducts = await getProducts();
        const related = allProducts
          .filter(p => p.MaDanMuc === productData.MaDanMuc && p.MaSanPham !== productData.MaSanPham)
          .slice(0, 4);
        setRelatedProducts(related);

        // Check if product is in favorites
        const token = localStorage.getItem('token');
        if (token) {
          const favorites = await getFavorites(token);
          const isFav = favorites.some((f: any) => f.MaSanPham === productData.MaSanPham);
          setIsFavorite(isFav);
        }

        // Fetch reviews for this product
        const reviewsResponse = await axios.get(`http://localhost:3000/api/comment`);
        const productReviews = reviewsResponse.data.filter((r: any) => r.MaSanPham === productData.MaSanPham && r.TrangThai === 'da_duyet');
        setReviews(productReviews);

        // Calculate average rating
        if (productReviews.length > 0) {
          const avg = productReviews.reduce((sum: number, review: any) => sum + review.SoSao, 0) / productReviews.length;
          setAverageRating(avg);

          // Calculate rating distribution
          const distribution = [0, 0, 0, 0, 0];
          productReviews.forEach((review: any) => {
            distribution[5 - review.SoSao]++;
          });
          setRatingDistribution(distribution);
        }

        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải thông tin sản phẩm');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else {
      if (quantity > 1) setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem('token');
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
      const cartItem = {
        MaSanPham: product.MaSanPham,
        TenSanPham: product.TenSanPham,
        Gia: product.Gia,
        SoLuong: quantity,
        Size: selectedSize,
        Hinh: product.Hinh
      };

      const response = await addToCart(cartItem);

      if (response.success) {
        const count = await getCartCount();
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

const handleBuyNow = async () => {
  if (!product) return;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || '{}');

  if (!token || !user.MaKhachHang) {
    Swal.fire({
      title: "Thông báo",
      text: "Vui lòng đăng nhập để mua hàng",
      icon: "warning",
      confirmButtonText: "Đăng nhập",
      showCancelButton: true,
      cancelButtonText: "Đóng"
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/login";
      }
    });
    return;
  }

  try {
    // Kiểm tra số lượng tồn kho
    if (product.SoLuong && product.SoLuong < quantity) {
      throw new Error(`Sản phẩm ${product.TenSanPham} chỉ còn ${product.SoLuong} sản phẩm`);
    }

    // Tạo đường dẫn hình ảnh đầy đủ
    const productImage = product.Hinh 
      ? product.Hinh.startsWith('/uploads/') 
        ? product.Hinh 
        : `/uploads/${product.Hinh}`
      : '';

    // Tạo đối tượng sản phẩm mua ngay
    const buyNowItem = {
      MaSanPham: product.MaSanPham,
      TenSanPham: product.TenSanPham,
      Gia: product.Gia,
      SoLuong: quantity,
      Size: selectedSize,
      Hinh: productImage, // Sử dụng đường dẫn đã xử lý
      MaGioHang: 0
    };

    // Lưu thông tin vào localStorage
    localStorage.setItem("buyNowItem", JSON.stringify({
      type: "buy_now",
      product: buyNowItem,
      customerInfo: {
        MaKhachHang: user.MaKhachHang,
        HoTen: user.HoTen,
        SoDienThoai: user.SoDienThoai,
        DiaChi: user.DiaChi
      }
    }));

    // Xóa thông tin giỏ hàng để tránh xung đột
    localStorage.removeItem("checkoutItems");
    
    // Chuyển hướng sang trang thanh toán
    window.location.href = "/thanhtoan";
  } catch (error: any) {
    Swal.fire({
      title: "Lỗi",
      text: error.message || "Đã xảy ra lỗi khi thực hiện mua ngay",
      icon: "error",
      confirmButtonText: "Đóng"
    });
    console.error('Lỗi khi mua ngay:', error);
  }
};

  const handleToggleFavorite = async () => {
    if (!product) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.MaKhachHang) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng đăng nhập để sử dụng tính năng này',
        icon: 'warning',
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Đóng',
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    try {
      if (isFavorite) {
        await deleteFavorite(product.MaSanPham!, token);
        setIsFavorite(false);
        Swal.fire({
          title: 'Thành công',
          text: 'Đã xóa khỏi danh sách yêu thích',
          icon: 'success',
          confirmButtonText: 'Đóng'
        });
      } else {
        await addToWishlist(user.MaKhachHang, product.MaSanPham!, token);
        setIsFavorite(true);
        Swal.fire({
          title: 'Thành công',
          text: 'Đã thêm vào danh sách yêu thích',
          icon: 'success',
          confirmButtonText: 'Đóng'
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Lỗi',
        text: error.message || 'Lỗi khi cập nhật yêu thích',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng đăng nhập để đánh giá sản phẩm',
        icon: 'warning',
        confirmButtonText: 'Đóng'
      });
      return;
    }

    if (!product?.MaSanPham) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Không tìm thấy sản phẩm',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/comment',
        {
          SoSao: newReview.rating,
          BinhLuan: newReview.comment,
          MaSanPham: product.MaSanPham
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: 'Thành công',
          text: response.data.message || 'Đánh giá của bạn đã được gửi và chờ duyệt',
          icon: 'success',
          confirmButtonText: 'Đóng'
        });

        // Reset form
        setNewReview({ rating: 5, comment: '' });

        // Refresh danh sách đánh giá
        fetchReviews(product.MaSanPham);
      } else {
        throw new Error(response.data.message || 'Lỗi khi gửi đánh giá');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Swal.fire({
        title: 'Lỗi',
        text: error.response?.data?.error || error.message || 'Lỗi khi gửi đánh giá',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const fetchReviews = async (productId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/comment`);
      const productReviews = response.data.filter(
        (r: any) => r.MaSanPham === productId && r.TrangThai === 'da_duyet'
      );

      setReviews(productReviews);

      // Tính toán average rating
      if (productReviews.length > 0) {
        const avg = productReviews.reduce(
          (sum: number, review: any) => sum + review.SoSao,
          0
        ) / productReviews.length;
        setAverageRating(avg);

        // Tính toán rating distribution
        const distribution = [0, 0, 0, 0, 0];
        productReviews.forEach((review: any) => {
          distribution[review.SoSao - 1]++;
        });
        setRatingDistribution(distribution);
      } else {
        setAverageRating(0);
        setRatingDistribution([0, 0, 0, 0, 0]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể tải đánh giá',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  useEffect(() => {
    if (product) {
      fetchReviews(product.MaSanPham!);
    }
  }, [product]);

  if (loading) {
    return <div className="loading">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">Không tìm thấy sản phẩm</div>;
  }

  return (
    <>
      <section className="product-detail">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/trangchu">Trang chủ</Link>
            <span>/</span>
            <Link to="/sanpham">Sản phẩm</Link>
            <span>/</span>
            <span className="active">Chi tiết sản phẩm</span>
          </div>

          <div className="product-containerct">
            <div className="product-gallery">
              <div className="main-image">
                <img
                  src={product.Hinh ? `http://localhost:3000${product.Hinh}` : '/default-product.jpg'}
                  alt={product.TenSanPham}
                  className="product-detail-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-product.jpg';
                  }}
                />
              </div>
            </div>

            <div className="product-ct">
              <h1 className="product-titlect">{product.TenSanPham}</h1>
              <div className="product-pricect">{formatPrice(product.Gia)}</div>

              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      fill={i < Math.floor(averageRating) ? '#D4AF37' : (i < averageRating ? '#D4AF37' : '#ddd')}
                      className="bi bi-star-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                    </svg>
                  ))}
                </div>
                <div className="reviews-count">({reviews.length} đánh giá)</div>
              </div>

              <p className="product-description">
                {product.MoTaNgan || 'Sản phẩm chất lượng cao từ thương hiệu uy tín'}
              </p>

              <div className="product-metact">
                <div className="meta-itemct">
                  <span className="meta-label">Danh mục:</span>
                  <span className="meta-value">{product.TenDanMuc || 'Trang sức'}</span>
                </div>

                <div className="meta-itemct">
                  <span className="meta-label">Chất liệu:</span>
                  <span className="meta-value">{product.ChatLieu}</span>
                </div>

                <div className="meta-itemct">
                  <span className="meta-label">Số lượng:</span>
                  <span className="meta-value">
                    {(product.SoLuong ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
              </div>
              <div className="meta-itemct">
                <span className="meta-label">Số lượng:</span>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn minus"
                    onClick={() => handleQuantityChange('decrease')}
                  >
                    -
                  </button>
                  <input
                    title='g'
                    type="text"
                    className="quantity-input"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="quantity-btn plus"
                    onClick={() => handleQuantityChange('increase')}
                  >
                    +
                  </button>
                </div>
                <button
                  style={{ marginLeft: 10 }}
                  className={`btn-wishlist ${isFavorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill={isFavorite ? 'red' : 'currentColor'}
                    className="bi bi-heart"
                    viewBox="0 0 16 16"
                    aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                  >
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                  </svg>
                </button>
              </div>
              {sizes.length > 0 && (
                <div className="size-selector">
                  <div className="size-title">Chọn kích thước:</div>
                  <div className="size-options">
                    {sizes.map((size, index) => (
                      <button
                        key={index}
                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-actions">
                <button
                  className="btn-add-to-cart"
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  className="btn-add-to-cart"
                  onClick={handleBuyNow}
                >
                  <strong>Mua ngay</strong>
                  <br />
                  <span style={{ fontSize: "75%" }}>
                    (Giao hàng miễn phí tận nơi)
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="product-tabs">
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Mô tả chi tiết
              </button>

              <button
                className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('specifications')}
              >
                Thông số kỹ thuật
              </button>

              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Đánh giá ({reviews.length})
              </button>
            </div>

            <div className={`tab-content ${activeTab === 'description' ? 'active' : ''}`} id="description">
              <div className="tab-description">
                <p>{product.NoiDungChiTiet || 'Chi tiết sản phẩm đang được cập nhật...'}</p>
              </div>
            </div>

            <div className={`tab-content ${activeTab === 'specifications' ? 'active' : ''}`} id="specifications">
              <div className="tab-description">
                <div className="meta-itemct">
                  <span className="meta-label">Chất liệu chính:</span>
                  <span className="meta-value">{product.ChatLieu}</span>
                </div>

                <div className="meta-itemct">
                  <span className="meta-label">Kích thước:</span>
                  <span className="meta-value">{product.Size || 'Đang cập nhật'}</span>
                </div>

                <div className="meta-itemct">
                  <span className="meta-label">Phân loại:</span>
                  <span className="meta-value">{product.PhanLoai || 'Unisex'}</span>
                </div>

                <div className="meta-itemct">
                  <span className="meta-label">Bảo hành:</span>
                  <span className="meta-value">Trọn đời</span>
                </div>
              </div>
            </div>

            <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews">
              <div className="reviews-overview">
                <div className="overall-rating">
                  <div className="rating-score">{averageRating.toFixed(1)}</div>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width={20}
                        height={20}
                        fill={i < Math.floor(averageRating) ? '#D4AF37' : (i < averageRating ? '#D4AF37' : '#ddd')}
                        className="bi bi-star-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                      </svg>
                    ))}
                  </div>
                  <div className="rating-count">{reviews.length} đánh giá</div>
                </div>

                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div className="rating-bar" key={star}>
                      <div className="star-label">{star} sao</div>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${reviews.length > 0 ?
                              (ratingDistribution[5 - star] / reviews.length * 100) : 0}%`
                          }}
                        />
                      </div>
                      <div className="bar-value">
                        {reviews.length > 0 ?
                          `${Math.round(ratingDistribution[5 - star] / reviews.length * 100)}%` : '0%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div className="review-item" key={review.MaDanhGia}>
                      <div className="review-header">
                        <div className="review-author">
                          <img
                            src={review.avatar ? `http://localhost:3000/uploads/${review.avatar}` : '/default-avatar.jpg'}
                            alt={review.HoTen}
                            className="review-avatar-t"
                          />
                          <span>{review.HoTen}</span>
                        </div>
                        <div className="review-date">
                          {new Date(review.NgayDanhGia).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            fill={i < review.SoSao ? '#D4AF37' : '#ddd'}
                            className="bi bi-star-fill"
                            viewBox="0 0 16 16"
                          >
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                          </svg>
                        ))}
                      </div>
                      <div className="review-text">
                        {review.BinhLuan}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">Chưa có đánh giá nào cho sản phẩm này</div>
                )}
              </div>
              <div className="add-review">
                <h3>Thêm đánh giá của bạn</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="rating-input">
                    <label>Đánh giá của bạn:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating}>
                          <input
                            type="radio"
                            id={`star${rating}`}
                            name="rating"
                            value={rating}
                            checked={newReview.rating === rating}
                            onChange={() => setNewReview({ ...newReview, rating })}
                            className="visually-hidden"
                          />
                          <label
                            htmlFor={`star${rating}`}
                            title={`${rating} sao`}
                            aria-label={`${rating} sao`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={20}
                              height={20}
                              fill={rating <= newReview.rating ? '#D4AF37' : '#ddd'}
                              className="bi bi-star-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="review-text">Nội dung đánh giá:</label>
                    <textarea
                      id="review-text"
                      className="form-control"
                      placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                      minLength={10}
                      maxLength={500}
                      rows={4}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={!newReview.comment || newReview.comment.length < 10}
                  >
                    Gửi đánh giá
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="related-products">
        <div className="container">
          <div className="section-title">
            <h2>Sản phẩm liên quan</h2>
            <p>Khám phá thêm các sản phẩm tương tự</p>
          </div>

          <div className="products-grid">
            {relatedProducts.map((product) => (
              <div className="product-card" key={product.MaSanPham}>
                <div className="product-image">
                  <img
                    src={product.Hinh ? `http://localhost:3000${product.Hinh}` : '/default-product.jpg'}
                    alt={product.TenSanPham}
                    className="product-detail-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-product.jpg';
                    }}
                  />

                  <div className="product-actionssp">
                    <button className="action-btn" title="Yêu thích">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-heart"
                        viewBox="0 0 16 16"
                      >
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15" />
                      </svg>
                    </button>
                    <button className="action-btn" title="Thêm vào giỏ">
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
                <Link to={`/san-pham/${product.MaSanPham}`}>
                <div className="product-info">
                  <span className="product-category">
                    {product.TenDanMuc || 'Trang sức'}
                  </span>

                  <h3 className="product-title">
                      {product.TenSanPham}
                  </h3>

                  <div className="product-price">
                    <span className="current-price">
                      {formatPrice(product.Gia)}
                    </span>
                  </div>

                  <div className="product-meta">
                    <span className="product-rating">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i}
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
        </div>
      </section>
    </>
  );
};

export default Sanphanct;