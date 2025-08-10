import { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import { NavLink } from "react-router-dom";
import { getCartCount } from "../../services/api/CartApi";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const header = document.getElementById("header");

    const handleScroll = () => {
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Check login status
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!userData);

    // Fetch cart items if logged in
    if (userData) {
      fetchCartCount();
    }

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const fetchCartCount = async () => {
    try {
      const count = await getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  };

  return (
    <header id="header" className="headertr">
      <div className="container header-container">
        <a href="/trangchu" className="logo">
          <img src={logo} alt="Logo" />
        </a>
        <button className="mobile-menu-btn" id="mobileMenuBtn" title="Mở menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            fill="currentColor"
            className="bi bi-list"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            />
          </svg>
        </button>

        <ul className="nav-links" id="navLinks">
          <li><NavLink to="/trangchu">Trang chủ</NavLink></li>
          <li><NavLink to="/sanpham">Sản phẩm</NavLink></li>
          <li><NavLink to="/aboutus">About Us</NavLink></li>
          <li><NavLink to="/lienhe">Liên hệ</NavLink></li>
          <li><NavLink to="/tintuc">Tin tức</NavLink></li>

          <li className="search-container">
            <form action="/search" method="get" className="search-form">
              <input
                type="text"
                name="q"
                placeholder="Tìm kiếm..."
                className="search-input"
              />
              <button type="submit" className="search-button" title="Mở">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  fill="#D4AF37"
                  className="bi bi-search"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </button>
            </form>
          </li>

          <li>
            <NavLink to="/giohang" className="cart-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                fill="currentColor"
                className="bi bi-bag-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z" />
              </svg>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </NavLink>
          </li>

          <li>
            <NavLink to={isLoggedIn ? "/profile" : "/login"} id="userBtn" title="Tài khoản">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                fill="currentColor"
                className="bi bi-person-circle"
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                />
              </svg>
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;