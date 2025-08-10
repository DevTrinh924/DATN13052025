import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/api/ClientApi";
import "../../assets/styles/auth/auth.css";

// types/auth.d.ts

const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: "",
    Email: "",
    MatKhau: "",
    DiaChi: "",
    SoDienThoai: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleToggleForm = (isLogin: boolean) => {
    setShowLogin(isLogin);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await loginUser({
      Email: formData.Email,
      MatKhau: formData.MatKhau,
    });

    if (response?.success) {
      // Sửa: Kiểm tra token tồn tại trước khi lưu
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      
      // Sửa: Kiểm tra user tồn tại trước khi lưu và chuyển hướng
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Sửa: Kiểm tra VaiTro tồn tại trước khi so sánh
        if (response.user.VaiTro === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError("Thông tin người dùng không hợp lệ");
      }
    } else {
      setError(response?.message || "Đăng nhập thất bại");
    }
  } catch (err) {
    setError("Lỗi kết nối server");
  }
};

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  if (formData.MatKhau.length < 8) {
    setError("Mật khẩu phải có ít nhất 8 ký tự");
    return;
  }

  try {
    const response = await registerUser(formData);
    
    if (response?.success) {
      // Sửa: Kiểm tra token tồn tại trước khi lưu
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      
      // Sửa: Kiểm tra user tồn tại trước khi lưu
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
      
      navigate("/");
    } else {
      setError(response?.message || "Đăng ký thất bại");
    }
  } catch (err) {
    setError("Lỗi kết nối server");
  }
};

  return (
    <div className="auth-container1">
      <div className="auth-container">
        {/* Decoration Section */}
        <div className="auth-decoration">
          <div className="decoration-pattern" />
          <div className="decoration-content">
            <div className="jewelry-icon">
              <i className="fas fa-gem" />
            </div>
            <div className="decoration-logo">LUXURYJEWELS</div>
            <h2 className="decoration-title">Sang Trọng &amp; Thanh Lịch</h2>
            <p className="decoration-text">
              Khám phá bộ sưu tập trang sức cao cấp của chúng tôi - nơi mỗi món đồ
              là một tác phẩm nghệ thuật tinh xảo. Tận hưởng trải nghiệm mua sắm độc
              quyền với dịch vụ chăm sóc khách hàng đẳng cấp.
            </p>
          </div>
        </div>

        {/* Forms Section */}
        <div className="auth-forms">
          <div className="forms-container">
            <div className="form-header">
              <h2>{showLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}</h2>
              <p>
                {showLogin
                  ? "Đăng nhập để tiếp tục trải nghiệm thế giới trang sức cao cấp"
                  : "Đăng ký để khám phá thế giới trang sức cao cấp"}
              </p>
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="form-toggle">
              <button
                className={`toggle-btn ${showLogin ? "active" : ""}`}
                onClick={() => handleToggleForm(true)}
              >
                Đăng nhập
              </button>
              <button
                className={`toggle-btn ${!showLogin ? "active" : ""}`}
                onClick={() => handleToggleForm(false)}
              >
                Đăng ký
              </button>
            </div>

            {/* Login Form */}
            {showLogin && (
              <div className="form-content active">
                <form id="loginFormElement" onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="Email" className="form-label">
                      Email
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-envelope" />
                      </div>
                      <input
                        type="email"
                        id="Email"
                        className="form-control"
                        placeholder="Nhập email của bạn"
                        value={formData.Email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="MatKhau" className="form-label">
                      Mật khẩu
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-lock" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="MatKhau"
                        className="form-control"
                        placeholder="Nhập mật khẩu"
                        value={formData.MatKhau}
                        onChange={handleInputChange}
                        required
                      />
                      <div
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                      </div>
                    </div>
                  </div>

                  <div className="remember-forgot">
                    <div className="remember-me">
                      <input type="checkbox" id="remember" />
                      <label htmlFor="remember">Ghi nhớ đăng nhập</label>
                    </div>
                    <a href="#" className="forgot-password">
                      Quên mật khẩu?
                    </a>
                  </div>

                  <button type="submit" className="btn-auth">
                    Đăng nhập
                  </button>
                </form>

                <div className="social-login">
                  <p>Hoặc đăng nhập bằng</p>
                  <div className="social-buttons">
                    <button type="button" className="social-btn facebook" aria-label="Đăng nhập bằng Facebook">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-facebook"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                      </svg>
                    </button>
                    <button type="button" className="social-btn google"   aria-label="Đăng nhập bằng Google">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-google"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-footer">
                  <p>
                    Chưa có tài khoản?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleForm(false);
                      }}
                    >
                      Tạo tài khoản
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Register Form */}
            {!showLogin && (
              <div className="form-content active">
                <form id="registerFormElement" onSubmit={handleRegister}>
                  <div className="form-group">
                    <label htmlFor="HoTen" className="form-label">
                      Họ và tên
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-user" />
                      </div>
                      <input
                        type="text"
                        id="HoTen"
                        className="form-control"
                        placeholder="Nhập họ và tên"
                        value={formData.HoTen}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="Email" className="form-label">
                      Email
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-envelope" />
                      </div>
                      <input
                        type="email"
                        id="Email"
                        className="form-control"
                        placeholder="Nhập email của bạn"
                        value={formData.Email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="SoDienThoai" className="form-label">
                      Số điện thoại
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-phone" />
                      </div>
                      <input
                        type="tel"
                        id="SoDienThoai"
                        className="form-control"
                        placeholder="Nhập số điện thoại"
                        value={formData.SoDienThoai}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="MatKhau" className="form-label">
                      Mật khẩu
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-lock" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="MatKhau"
                        className="form-control"
                        placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)"
                        value={formData.MatKhau}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                      />
                      <div
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="DiaChi" className="form-label">
                      Địa chỉ
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <i className="fas fa-home" />
                      </div>
                      <input
                        type="text"
                        id="DiaChi"
                        className="form-control"
                        placeholder="Nhập địa chỉ"
                        value={formData.DiaChi}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="remember-forgot">
                    <div className="remember-me">
                      <input type="checkbox" id="terms" required />
                      <label htmlFor="terms">
                        Tôi đồng ý với{" "}
                        <a href="#" style={{ color: "var(--gold)", fontWeight: 500 }}>
                          Điều khoản &amp; Chính sách
                        </a>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn-auth">
                    Đăng ký
                  </button>
                </form>

                <div className="social-login">
                  <p>Hoặc đăng ký bằng</p>
                  <div className="social-buttons">
                    <button type="button" className="social-btn facebook" aria-label="Đăng nhập bằng Facebook">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-facebook"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                      </svg>
                    </button>
                    <button type="button" className="social-btn google"   aria-label="Đăng nhập bằng Google">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-google"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="form-footer">
                  <p>
                    Đã có tài khoản?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleForm(true);
                      }}
                    >
                      Đăng nhập ngay
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;