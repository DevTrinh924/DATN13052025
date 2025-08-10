import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, removeFromCart, updateCartItem, clearCart, getCartCount } from "../../services/api/CartApi";
import { applyPromotion } from "../../services/api/PromotionApi";
import { createOrder } from "../../services/api/OrdersApi";
import { formatPrice } from "../../utils/formatPrice";
import Swal from "sweetalert2";
import "../../assets/styles/user/giohang.css";
import type {CartItem} from '../../types/models.ts';
const Giohang = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoName, setPromoName] = useState("");
  const [loading, setLoading] = useState(true);

  // Tính tổng tiền
  const subtotal = cartItems.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
  const shippingFee = 20000;
  const total = subtotal - discount+shippingFee;

  // Lấy giỏ hàng từ API
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const items = await getCart();
      setCartItems(items);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (cartId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Thông báo",
          text: "Vui lòng đăng nhập để thực hiện thao tác này",
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Xác nhận",
        text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await removeFromCart(cartId);
        await fetchCart();
        // Cập nhật số lượng giỏ hàng
        const count = await getCartCount();
        setCartItems(prevItems => prevItems.filter(item => item.MaGioHang !== cartId));
        
        Swal.fire({
          title: "Thành công",
          text: "Đã xóa sản phẩm khỏi giỏ hàng",
          icon: "success",
          confirmButtonText: "Đóng",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Đã xảy ra lỗi khi xóa sản phẩm",
        icon: "error",
        confirmButtonText: "Đóng",
      });
    }
  };

  // Cập nhật số lượng sản phẩm
  const handleUpdateQuantity = async (cartId: number, newQuantity: number) => {
    try {
      if (newQuantity < 1) return;

      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Thông báo",
          text: "Vui lòng đăng nhập để thực hiện thao tác này",
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        return;
      }

      await updateCartItem(cartId, newQuantity);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.MaGioHang === cartId ? { ...item, SoLuong: newQuantity } : item
        )
      );
    } catch (error: any) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      Swal.fire({
        title: "Lỗi",
        text: error.message || "Số lượng sản phẩm không đủ",
        icon: "error",
        confirmButtonText: "Đóng",
      });
      // Refresh lại giỏ hàng để hiển thị số lượng chính xác
      await fetchCart();
    }
  };

  // Xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Thông báo",
          text: "Vui lòng đăng nhập để thực hiện thao tác này",
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        return;
      }

      const result = await Swal.fire({
        title: "Xác nhận",
        text: "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await clearCart();
        setCartItems([]);
        setDiscount(0);
        setPromoCode("");
        setPromoName("");
        
        Swal.fire({
          title: "Thành công",
          text: "Đã xóa toàn bộ giỏ hàng",
          icon: "success",
          confirmButtonText: "Đóng",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Đã xảy ra lỗi khi xóa giỏ hàng",
        icon: "error",
        confirmButtonText: "Đóng",
      });
    }
  };

  // Áp dụng mã giảm giá
  const handleApplyPromo = async () => {
    try {
      if (!promoCode) {
        Swal.fire({
          title: "Thông báo",
          text: "Vui lòng nhập mã giảm giá",
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "Thông báo",
          text: "Vui lòng đăng nhập để sử dụng mã giảm giá",
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        return;
      }

      const result = await applyPromotion(promoCode, subtotal);
      if (result.success) {
        setDiscount(result.discountAmount);
        setPromoName(result.promotionName);
        Swal.fire({
          title: "Thành công",
          text: `Áp dụng mã giảm giá "${result.promotionName}" thành công`,
          icon: "success",
          confirmButtonText: "Đóng",
        });
      } else {
        throw new Error(result.message || "Không thể áp dụng mã giảm giá");
      }
    } catch (error: any) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      Swal.fire({
        title: "Lỗi",
        text: error.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        icon: "error",
        confirmButtonText: "Đóng",
      });
    }
  };

  // Thanh toán
// Thay đổi hàm handleCheckout trong Giohang.tsx
const handleCheckout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập để thanh toán",
        icon: "warning",
        confirmButtonText: "Đóng",
      });
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        title: "Thông báo",
        text: "Giỏ hàng của bạn đang trống",
        icon: "warning",
        confirmButtonText: "Đóng",
      });
      return;
    }

    // Lưu thông tin giỏ hàng vào localStorage để trang thanh toán có thể lấy
    localStorage.setItem("checkoutItems", JSON.stringify({
      items: cartItems,
      promoCode,
      discount,
      promoName,
      subtotal,
      total
    }));

    // Chuyển hướng sang trang thanh toán
    window.location.href = "/thanhtoan";
  } catch (error: any) {
    console.error("Lỗi khi chuyển sang thanh toán:", error);
    Swal.fire({
      title: "Lỗi",
      text: error.message || "Đã xảy ra lỗi khi chuyển sang thanh toán",
      icon: "error",
      confirmButtonText: "Đóng",
    });
  }
};
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <>
      {/* breadcrumb */}
      <section className="breadcrumbgh">
        <div className="container">
          <div className="breadcrumlh-content">
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumlh-separator">/</span>
            <span className="breadcrumlh-current">Giỏ hàng</span>
          </div>
        </div>
      </section>

      {/* Cart Page */}
      <section className="cart-page">
        <div className="container">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
              </div>
              <h3>Giỏ hàng của bạn đang trống</h3>
              <p>Hãy khám phá cửa hàng và thêm sản phẩm vào giỏ hàng!</p>
              <Link to="/sanpham" className="btn-luxury-gh">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="cart-container">
              <div className="cart-items">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Tổng</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.MaGioHang}>
                        <td data-label="Sản phẩm">
                          <div className="cart-item">
                            <div className="cart-item-img">
                            <img
                            src={item.Hinh 
                            ? `http://localhost:3000${item.Hinh.startsWith('/uploads/') ? item.Hinh : `/uploads/${item.Hinh}`}`
                            : "/default-product.jpg"}
                            alt={item.TenSanPham}
                            onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/default-product.jpg";
                            }}
                            />
                            </div>
                            <div className="cart-item-details">
                              <Link 
                                to={`/san-pham/${item.MaSanPham}`}
                                className="cart-item-title"
                                 style={{ textDecoration: "none", color: "inherit" }}
                              >
                                {item.TenSanPham}
                              </Link>
                             <div className="order-item-meta">
                              {item.Size && <span>Size: {item.Size}</span>}
                            </div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Giá">
                          <div className="cart-item-price">{formatPrice(item.Gia)}</div>
                        </td>
                        <td data-label="Số lượng">
                          <div className="cart-item-quantity">
                            <button
                              className="quantity-btn minus"
                              onClick={() =>
                                handleUpdateQuantity(item.MaGioHang, item.SoLuong - 1)
                              }
                            >
                              -
                            </button>
                            <input
                            title="J"
                              type="number"
                              className="quantity-input"
                              value={item.SoLuong}
                              min={1}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.MaGioHang,
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                            <button
                              className="quantity-btn plus"
                              onClick={() =>
                                handleUpdateQuantity(item.MaGioHang, item.SoLuong + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td data-label="Tổng">
                          <div className="cart-item-total">
                            {formatPrice(item.Gia * item.SoLuong)}
                          </div>
                        </td>
                        <td>
                          <button
                          title="D"
                            className="cart-item-remove"
                            onClick={() => handleRemoveItem(item.MaGioHang)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={20}
                              height={20}
                              fill="currentColor"
                              className="bi bi-x-lg"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cart-actions">
                  <Link to="/sanpham" className="btn-luxury continue-shopping">
                    Tiếp tục mua sắm
                  </Link>
                  <button
                    className="btn-luxury update-cart"
                    onClick={handleClearCart}
                  >
                    Xóa giỏ hàng
                  </button>
                </div>
              </div>
              <div className="cart-summary">
                <h3 className="summary-title">Tóm tắt đơn hàng</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="summary-label">Tạm tính</span>
                    <span className="summary-value">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Phí vận chuyển</span>
                    <span className="summary-value">{formatPrice(shippingFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">Giảm giá ({promoName})</span>
                      <span className="summary-value">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>
                <div className="summary-row total-row">
                  <span className="summary-label">Tổng cộng</span>
                  <span className="summary-value">{formatPrice(total)}</span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Tiến hành thanh toán
                </button>
                <div className="tag-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="currentColor"
                    className="bi bi-tags-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                    <path d="M1.293 7.793A1 1 0 0 1 1 7.086V2a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l.043-.043z" />
                  </svg>
                  <span>Mã ưu đãi</span>
                </div>
                <div className="text-details">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá ..."
                    className="MaVoucher"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    className="checkout-btn"
                    onClick={handleApplyPromo}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Giohang;