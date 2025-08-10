import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/api/ClientApi";
import { getCart, clearCart as apiClearCart } from "../../services/api/CartApi";
import { createOrder } from "../../services/api/OrdersApi";
import { applyPromotion } from "../../services/api/PromotionApi";
import { formatPrice } from "../../utils/formatPrice";
import Swal from "sweetalert2";
import "../../assets/styles/user/Thanhtoan.css";
import type { CartItem } from '../../types/models.ts';

interface UserInfo {
  MaKhachHang?: number;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  DiaChi: string;
}

const Thanhtoan = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    HoTen: "",
    Email: "",
    SoDienThoai: "",
    DiaChi: "",
  });
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    district: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoName, setPromoName] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
  const shippingFee = 20000;
  const total = subtotal - discount + shippingFee;

  // Hàm xóa sản phẩm khỏi danh sách thanh toán
  const handleRemoveItem = async (itemId: number) => {
    const result = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        if (isBuyNow) {
          // Nếu là mua ngay, xóa buyNowItem và chuyển về trang sản phẩm
          localStorage.removeItem("buyNowItem");
          navigate("/sanpham");
          return;
        } else {
          const updatedItems = cartItems.filter(item => item.MaSanPham !== itemId);
          setCartItems(updatedItems);

          // Cập nhật localStorage nếu dữ liệu đến từ giỏ hàng
          const checkoutData = localStorage.getItem("checkoutItems");
          if (checkoutData) {
            localStorage.setItem('checkoutItems', JSON.stringify({
              items: updatedItems,
              promoCode,
              discount,
              promoName
            }));
          }

          // Nếu danh sách sản phẩm rỗng, chuyển hướng về giỏ hàng
          if (updatedItems.length === 0) {
            Swal.fire({
              title: "Thông báo",
              text: "Danh sách sản phẩm trống. Bạn sẽ được chuyển hướng về giỏ hàng.",
              icon: "info",
              confirmButtonText: "Đóng",
            }).then(() => {
              localStorage.removeItem("checkoutItems");
              navigate("/giohang");
            });
          } else {
            Swal.fire({
              title: "Thành công",
              text: "Đã xóa sản phẩm khỏi đơn hàng",
              icon: "success",
              confirmButtonText: "Đóng",
            });
          }
        }
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: "Đã xảy ra lỗi khi xóa sản phẩm",
          icon: "error",
          confirmButtonText: "Đóng",
        });
      }
    }
  };

  // Hàm thoát thanh toán
  const handleCancelCheckout = async () => {
    const result = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có muốn hủy quá trình thanh toán?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Hủy thanh toán",
      cancelButtonText: "Tiếp tục thanh toán",
    });

    if (result.isConfirmed) {
      // Xóa dữ liệu tạm
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("buyNowItem");
      
      // Chuyển hướng về trang trước
      navigate(isBuyNow ? "/sanpham" : "/giohang");
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await apiClearCart();
        setCartItems([]);
      }
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
    }
  };

const fetchData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập để thanh toán",
        icon: "warning",
        confirmButtonText: "Đóng",
      }).then(() => navigate("/dangnhap"));
      return;
    }

    // Kiểm tra xem có phải là mua ngay không
    const buyNowData = localStorage.getItem("buyNowItem");
    if (buyNowData) {
      const { product, customerInfo } = JSON.parse(buyNowData);
      setCartItems([product]); // Chỉ chứa 1 sản phẩm mua ngay
      setIsBuyNow(true);
      
      // Cập nhật thông tin người dùng từ dữ liệu mua ngay
      setUserInfo({
        MaKhachHang: customerInfo.MaKhachHang,
        HoTen: customerInfo.HoTen,
        Email: customerInfo.Email || "",
        SoDienThoai: customerInfo.SoDienThoai || "",
        DiaChi: customerInfo.DiaChi || "",
      });
      
      setShippingInfo(prev => ({
        ...prev,
        address: customerInfo.DiaChi || ""
      }));
      
      // Xóa dữ liệu giỏ hàng để tránh xung đột
      localStorage.removeItem("checkoutItems");
    } else {
      // Nếu không phải mua ngay, lấy dữ liệu từ giỏ hàng
      const checkoutData = localStorage.getItem("checkoutItems");
      if (checkoutData) {
        const { items, promoCode, discount, promoName } = JSON.parse(checkoutData);
        setCartItems(items || []);
        setPromoCode(promoCode || '');
        setDiscount(discount || 0);
        setPromoName(promoName || '');
      } else {
        const cartResponse = await getCart();
        if (cartResponse && Array.isArray(cartResponse)) {
          setCartItems(cartResponse);
        }
      }
      setIsBuyNow(false);
    }

    // Lấy thông tin người dùng nếu không phải mua ngay
    if (!buyNowData) {
      const userResponse = await getCurrentUser(token);
      if (userResponse.success && userResponse.user) {
        const user = userResponse.user;
        setUserInfo({
          MaKhachHang: user.MaKhachHang,
          HoTen: user.HoTen,
          Email: user.Email,
          SoDienThoai: user.SoDienThoai || "",
          DiaChi: user.DiaChi || "",
        });
        setShippingInfo(prev => ({
          ...prev,
          address: user.DiaChi || ""
        }));
      }
    }
    
    setLoading(false);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
    setLoading(false);
    Swal.fire({
      title: "Lỗi",
      text: "Đã xảy ra lỗi khi tải dữ liệu",
      icon: "error",
      confirmButtonText: "Đóng",
    });
  }
};

  useEffect(() => {
    fetchData();
  }, []);

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

      const result = await applyPromotion(promoCode, subtotal);
      if (result.success) {
        setDiscount(result.discountAmount);
        setPromoName(result.promotionName || "Mã giảm giá");
        setAppliedPromo(true);
        // Cập nhật localStorage nếu dùng giỏ hàng
        if (!isBuyNow) {
          const checkoutData = localStorage.getItem("checkoutItems");
          if (checkoutData) {
            localStorage.setItem('checkoutItems', JSON.stringify({
              items: cartItems,
              promoCode,
              discount: result.discountAmount,
              promoName: result.promotionName || "Mã giảm giá"
            }));
          }
        }
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
      setDiscount(0);
      setAppliedPromo(false);
      Swal.fire({
        title: "Lỗi",
        text: error.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        icon: "error",
        confirmButtonText: "Đóng",
      });
    }
  };

  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const requiredFields = [
        { field: userInfo.HoTen, message: "Vui lòng nhập họ tên" },
        { field: userInfo.SoDienThoai, message: "Vui lòng nhập số điện thoại" },
        { field: shippingInfo.address, message: "Vui lòng nhập địa chỉ" },
        { field: shippingInfo.city, message: "Vui lòng nhập thành phố" },
        { field: shippingInfo.district, message: "Vui lòng nhập quận/huyện" },
      ];

      const missingField = requiredFields.find(f => !f.field);
      if (missingField) {
        Swal.fire({
          title: "Thông báo",
          text: missingField.message,
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        setIsSubmitting(false);
        return;
      }

      if (cartItems.length === 0) {
        Swal.fire({
          title: "Thông báo",
          text: "Giỏ hàng của bạn đang trống",
          icon: "warning",
          confirmButtonText: "Đóng",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await Swal.fire({
        title: "Xác nhận thanh toán",
        html: `
          <div style="text-align: left;">
            <p><strong>Tổng số tiền thanh toán:</strong> ${formatPrice(total)}</p>
            <p><strong>Phương thức thanh toán:</strong> ${paymentMethod === "COD" ? "Thanh toán khi nhận hàng" :
            paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : "Ví điện tử"
          }</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${shippingInfo.address}, ${shippingInfo.district}, ${shippingInfo.city}</p>
            ${shippingInfo.note ? `<p><strong>Ghi chú:</strong> ${shippingInfo.note}</p>` : ''}
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });

      if (!result.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        customerId: userInfo.MaKhachHang,
        items: cartItems.map(item => ({
          productId: item.MaSanPham,
          quantity: item.SoLuong,
          price: item.Gia,
          size: item.Size,
          Hinh: item.Hinh
        })),
        paymentMethod: paymentMethod === "bank" ? "ChuyenKhoan" :
          paymentMethod === "ewallet" ? "ViDienTu" : "COD",
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.district}, ${shippingInfo.city}`,
        totalAmount: total,
        TenNguoiNhan: userInfo.HoTen,
        SoDienThoaiNhan: userInfo.SoDienThoai,
        MaKhuyenMai: appliedPromo ? promoCode : null
      };

      const response = await createOrder(orderData);

      if (response && response.success) {
        // Xóa dữ liệu tạm sau khi đặt hàng thành công
        localStorage.removeItem("checkoutItems");
        localStorage.removeItem("buyNowItem");
        
        if (!isBuyNow) {
          await clearCart();
        }

        Swal.fire({
          title: "Thành công",
          text: "Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất",
          icon: "success",
          confirmButtonText: "Đóng",
        }).then(() => {
          window.location.href = "/profile";
        });
      } else {
        throw new Error(response?.message || "Đặt hàng không thành công");
      }
    } catch (error: any) {
      console.error("Lỗi khi thanh toán:", error);
      let errorMessage = "Đã xảy ra lỗi khi thanh toán";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = "Vui lòng đăng nhập để thanh toán";
          navigate("/dangnhap");
        } else if (error.response.status === 400) {
          if (error.response.data.errors) {
            errorMessage = Object.values(error.response.data.errors).join("\n");
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Lỗi",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Đóng",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="checkout-container">
        {/* Left: Customer Information */}
        <div className="checkout-form-section">
          <div className="form-section">
            <div className="form-title">
              <i className="fas fa-user" />
              <h2>Thông tin khách hàng</h2>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullname">Họ và tên *</label>
                <input
                  type="text"
                  id="fullname"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={userInfo.HoTen}
                  onChange={(e) => setUserInfo({ ...userInfo, HoTen: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="email@example.com"
                  value={userInfo.Email}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="0123 456 789"
                  value={userInfo.SoDienThoai}
                  onChange={(e) => setUserInfo({ ...userInfo, SoDienThoai: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="form-title">
              <i className="fas fa-truck" />
              <h2>Địa chỉ giao hàng</h2>
            </div>
            <div className="form-group">
              <label htmlFor="address">Địa chỉ *</label>
              <input
                type="text"
                id="address"
                placeholder="Số nhà, tên đường"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Thành phố *</label>
                <input
                  type="text"
                  id="city"
                  placeholder="Nhập thành phố..."
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="district">Quận/Huyện *</label>
                <input
                  type="text"
                  id="district"
                  placeholder="Nhập Quận/Huyện..."
                  value={shippingInfo.district}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="note">Ghi chú giao hàng (tùy chọn)</label>
              <textarea
                id="note"
                rows={3}
                placeholder="Ví dụ: Giao hàng giờ hành chính"
                value={shippingInfo.note}
                onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
              />
            </div>
          </div>
          <div className="form-section">
            <div className="form-title">
              <i className="fas fa-credit-card" />
              <h2>Phương thức thanh toán</h2>
            </div>
            <div className="payment-methods">
              <div className={`payment-method ${paymentMethod === "COD" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  id="cod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <label htmlFor="cod">
                  <i className="fas fa-money-bill-wave payment-icon" />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
              <div className={`payment-method ${paymentMethod === "bank" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  id="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                />
                <label htmlFor="bank">
                  <i className="fas fa-university payment-icon" />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
              </div>
              <div className={`payment-method ${paymentMethod === "ewallet" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  id="ewallet"
                  checked={paymentMethod === "ewallet"}
                  onChange={() => setPaymentMethod("ewallet")}
                />
                <label htmlFor="ewallet">
                  <i className="fas fa-wallet payment-icon" />
                  <span>Ví điện tử (Momo, ZaloPay)</span>
                </label>
              </div>
            </div>
          </div>
          {/* Nút thoát thanh toán */}
          <button
            className="cancel-checkout-btn"
            onClick={handleCancelCheckout}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="currentColor"
              className="bi bi-box-arrow-left"
              viewBox="0 0 16 16"
            >
              <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
              <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
            </svg>
            <span>Hủy thanh toán</span>
          </button>
        </div>

        {/* Right: Order Summary */}
        <div className="order-summary">
          <div className="order-summary-box">
            <h3 className="order-summary-title">
              <i className="fas fa-shopping-bag" /> Tóm tắt đơn hàng
            </h3>
            <div className="order-items">
              {cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div className="order-item" key={index}>
                    <div className="order-item-img">
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
                    <div className="order-item-details">
                      <div className="order-item-name">{item.TenSanPham}</div>
                      <div className="order-item-meta">
                        <span>{item.Size && <span>Size: {item.Size}</span>}</span>
                        <span>Số lượng: {item.SoLuong}</span>
                      </div>
                      <div className="order-item-price">{formatPrice(item.Gia)}</div>
                    </div>
                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.MaSanPham)}
                      title="Xóa sản phẩm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-x-lg"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-cart-message">Giỏ hàng trống</div>
              )}
            </div>
            <div className="promo-code">
              <input
                type="text"
                placeholder="Mã giảm giá"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={appliedPromo}
              />
              <button
                onClick={handleApplyPromo}
                disabled={appliedPromo}
              >
                {appliedPromo ? "Đã áp dụng" : "Áp dụng"}
              </button>
            </div>
            <div className="order-totals">
              <div className="total-row">
                <span className="total-label">Tạm tính</span>
                <span className="total-value">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="total-row">
                  <span className="total-label">Giảm giá ({promoName})</span>
                  <span className="total-value">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="total-row">
                <span className="total-label">Phí vận chuyển</span>
                <span className="total-value">{formatPrice(shippingFee)}</span>
              </div>
              <div className="grand-total total-row">
                <span className="total-label">Tổng cộng</span>
                <span className="total-value">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              className="complete-order"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-lock" /> Hoàn tất đơn hàng
                </>
              )}
            </button>
            <div className="secure-checkout">
              <i className="fas fa-shield-alt" />
              <span>Giao dịch an toàn - Bảo mật thông tin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thanhtoan;