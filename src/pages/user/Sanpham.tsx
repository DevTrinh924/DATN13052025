import { useState, useEffect, } from "react";
import axios from "axios";
import "../../assets/styles/user/sanpham.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { addToCart, getCartCount } from "../../services/api/CartApi";
import { addToWishlist, deleteFavorite, getFavorites } from "../../services/api/YeuthichApi";
import { formatPrice } from "../../utils/formatPrice";

// Định nghĩa kiểu dữ liệu
interface Product {
  MaSanPham: number;
  TenSanPham: string;
  Gia: number;
  Hinh: string;
  SoLuong: number;
  MoTaNgan: string;
  Size: string;
  PhanLoai: string;
  ChatLieu: string;
  NoiDungChiTiet: string;
  MaDanMuc: number;
  TenDanMuc?: string;
}

interface Category {
  MaDanMuc: number;
  TenDanMuc: string;
  hinh_dm: string;
}

interface Favorite {
  MaKhachHang: number;
  MaSanPham: number;
  HoTen?: string;
  TenSanPham?: string;
  Gia?: number;
  Hinh?: string;
  TenDanMuc?: string;
  NgayThem?: string;
  avatar?: string;
  Size?: string;
  ChatLieu?: string;
  NoiDungChiTiet?: string;
  SanPhamHinh?: string;
}
const Sanpham = () => {
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [, setError] = useState<string | null>(null);
  const [, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]); // Lưu trữ các MaSanPham đã yêu thích
  const [openFilters, setOpenFilters] = useState<{ [key: string]: boolean }>({
    category: true,
    material: true,
    price: true,
  });
  // Thêm state phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const toggleFilter = (key: string) => {
    setOpenFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const [filters, setFilters] = useState({
    category: "",
    material: "",
    minPrice: 0,
    maxPrice: 50000000,
    gender: "all", // Thêm bộ lọc giới tính
  });
  // Hàm kiểm tra sản phẩm đã được yêu thích bởi người dùng hiện tại chưa
  const isFavorite = (productId: number) => {
    const userString = localStorage.getItem("user");
    if (!userString) return false;

    const user = JSON.parse(userString);
    return userFavorites.some(fav => fav.MaSanPham === productId && fav.MaKhachHang === user.MaKhachHang);
  };
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
    // Find the product to get its details
    const product = products.find(p => p.MaSanPham === productId);
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
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
  // Lấy danh sách yêu thích khi component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const favoritesData = await getFavorites(token);
          setFavorites(favoritesData.map((fav: any) => fav.MaSanPham));
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
      }
    };

    fetchFavorites();
  }, []);
  // Lấy dữ liệu sản phẩm và danh mục
   const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/products"),
          axios.get("http://localhost:3000/api/categories")
        ]);

        // Xử lý dữ liệu sản phẩm
        let productsData: Product[] = [];
        if (Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        } else if (Array.isArray(productsResponse.data.data)) {
          productsData = productsResponse.data.data;
        }

        setProducts(productsData);
        setFilteredProducts(productsData);


        // Xử lý dữ liệu danh mục
        let categoriesData: Category[] = [];
        if (Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        } else if (Array.isArray(categoriesResponse.data.data)) {
          categoriesData = categoriesResponse.data.data;
        }

        setCategories(categoriesData);

        // Lấy danh sách chất liệu duy nhất
        const uniqueMaterials = [
          ...new Set(productsData.map((product) => product.ChatLieu)),
        ];
        setMaterials(uniqueMaterials);

      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  // Áp dụng bộ lọc khi có thay đổi
  useEffect(() => {
    if (products.length === 0) return;

    let result = [...products];

    // Lọc theo danh mục
    if (filters.category) {
      result = result.filter(
        (product) => product.MaDanMuc.toString() === filters.category
      );
    }

    // Lọc theo chất liệu
    if (filters.material) {
      result = result.filter(
        (product) => product.ChatLieu === filters.material
      );
    }

    // Lọc theo giới tính
    if (filters.gender !== "all") {
      result = result.filter(
        (product) => product.PhanLoai === filters.gender
      );
    }

    // Lọc giá cả
    result = result.filter(
      (product) =>
        product.Gia >= filters.minPrice && product.Gia <= filters.maxPrice
    );

    // Sắp xếp
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.Gia - b.Gia);
        break;
      case "price-high":
        result.sort((a, b) => b.Gia - a.Gia);
        break;
      case "name-asc":
        result.sort((a, b) => a.TenSanPham.localeCompare(b.TenSanPham));
        break;
      case "name-desc":
        result.sort((a, b) => b.TenSanPham.localeCompare(a.TenSanPham));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset về trang đầu tiên khi bộ lọc thay đổi
  }, [filters, sortOption, products]);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterType: string, value: string | number) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  // Xử lý thay đổi khoảng giá
  const handlePriceChange = (min: number, max: number) => {
    // Đảm bảo min không lớn hơn max
    const newMin = Math.min(min, max);
    const newMax = Math.max(min, max);

    setFilters({
      ...filters,
      minPrice: newMin,
      maxPrice: newMax,
    });
  };

  // Tính toán phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Tạo mảng số trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  return (
    <>
      <section className="product-page" id="sanphana">
        <div className="container">
          <div className="breadcrumb">
            <a href="/trangchu">Trang chủ</a>
            <span>/</span>
            <a href="/sanpham">Sản phẩm</a>
            <span>/</span>
            <a href="#" className="active">
              Tất cả sản phẩm
            </a>
          </div>
          <div className="product-container" >
            {/* Filter Sidebar */}
            <aside className="filter-sidebar">
              <div className="filter-widget">
                <div className="filter-title" onClick={() => toggleFilter("category")}>
                  <h3>Danh mục</h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className={`bi ${openFilters.category ? "bi-chevron-up" : "bi-chevron-down"}`}
                    viewBox="0 0 16 16"
                  >
                    {openFilters.category ? (
                      <path
                        fillRule="evenodd"
                        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    )}
                  </svg>
                </div>
                {openFilters.category && (
                  <div className="filter-content">
                    <ul className="filter-list">
                      <li>
                        <a href="#"
                          onClick={() => handleFilterChange("category", "")}
                          className={!filters.category ? "active" : ""}
                        >
                          Tất cả sản phẩm
                        </a>
                      </li>

                      {categories.map((category) => (
                        <li key={category.MaDanMuc}>
                          <a href="#"
                            onClick={() =>
                              handleFilterChange(
                                "category",
                                category.MaDanMuc.toString()
                              )
                            }
                            className={
                              filters.category === category.MaDanMuc.toString()
                                ? "active"
                                : ""
                            }
                          >
                            {category.TenDanMuc}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>


              <div className="filter-widget">
                <div className="filter-title" onClick={() => toggleFilter("material")}>
                  <h3>Chất liệu</h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className={`bi ${openFilters.category ? "bi-chevron-up" : "bi-chevron-down"}`}
                    viewBox="0 0 16 16"
                  >
                    {openFilters.category ? (
                      <path
                        fillRule="evenodd"
                        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    )}
                  </svg>
                </div>
                {openFilters.material && (
                  <div className="filter-content">
                    <ul className="filter-list">
                      <li>
                        <a href="#"
                          onClick={() => handleFilterChange("material", "")}
                          className={!filters.material ? "active" : ""}
                        >
                          Tất cả chất liệu
                        </a>
                      </li>
                      {materials.map((material, index) => (
                        <li key={index}>
                          <a href="#"
                            onClick={() =>
                              handleFilterChange("material", material)
                            }
                            className={
                              filters.material === material ? "active" : ""
                            }
                          >
                            {material}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="filter-widget">
                <div className="filter-title" onClick={() => toggleFilter("price")}>
                  <h3>Lọc theo giá</h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className={`bi ${openFilters.category ? "bi-chevron-up" : "bi-chevron-down"}`}
                    viewBox="0 0 16 16"
                  >
                    {openFilters.category ? (
                      <path
                        fillRule="evenodd"
                        d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    )}
                  </svg>
                </div>
                {openFilters.price && (
                  <div className="filter-content">
                    <div className="price-range-slider">
                      <input
                        type="range"
                        className="price-range min-range"
                        min={0}
                        max={50000000}
                        step={100000}
                        value={filters.minPrice}
                        onChange={(e) => handlePriceChange(parseInt(e.target.value), filters.maxPrice)}
                        title="f"
                      />
                      <input
                        title="f"
                        type="range"
                        className="price-range max-range"
                        min={0}
                        max={50000000}
                        step={100000}
                        value={filters.maxPrice}
                        onChange={(e) => handlePriceChange(filters.minPrice, parseInt(e.target.value))}
                      />
                    </div>
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <label>Từ:</label> <br />
                        <input
                          title="f"
                          type="number"
                          min={0}
                          max={50000000}
                          style={{ width: 100 }}
                          value={filters.minPrice}
                          onChange={(e) => handlePriceChange(parseInt(e.target.value || "0"), filters.maxPrice)}
                        />
                      </div>
                      <div className="price-input-group">
                        <label>Đến</label> <br />
                        <input
                          title="f"
                          type="number"
                          min={0}
                          max={50000000}
                          value={filters.maxPrice}
                          style={{ width: 100 }}
                          onChange={(e) => handlePriceChange(filters.minPrice, parseInt(e.target.value || "50000000"))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <div className="product-main">
              <div className="sort-options" style={{ display: "flex", justifyContent: "space-between" }}>
                <select
                  title="f"
                  style={{
                    padding: "15px 15px",
                    border: "1px solid #ddd",
                    borderRadius: 3
                  }}
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                >
                  <option value="all">Tất cả trang sức</option>
                  <option value="Unisex">Nam và nữ</option>
                  <option value="Nam">Trang sức nam</option>
                  <option value="Nữ">Trang sức nữ</option>
                </select>
                <select
                  title="h"
                  style={{
                    padding: "15px 15px",
                    border: "1px solid #ddd",
                    borderRadius: 3
                  }}
                  onChange={handleSortChange}
                  value={sortOption}
                >
                  <option value="default">Sắp xếp theo: Mặc định</option>
                  <option value="price-low">Giá: Thấp đến cao</option>
                  <option value="price-high">Giá: Cao đến thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                  <option value="name-desc">Tên: Z-A</option>
                </select>
              </div>

              <div className="product-grid">
                {currentProducts.map((product) => (
                  <div className="product-card" key={product.MaSanPham}>
                   
                    <div className="product-image">
                      <img
                        src={product.Hinh ? `http://localhost:3000${product.Hinh}` : '/default-product.jpg'}
                        alt={product.TenSanPham}
                        className="product-img-db"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-product.jpg';
                        }}
                      />
                      <div className="product-actionssp">
                        <button
                          className="action-btn"
                          title="Yêu thích"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.MaSanPham);
                          }}>
                          <svg xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            fill={isFavorite(product.MaSanPham) ? "#ff0000" : "currentColor"}
                            className="bi bi-heart-fill"
                            viewBox="0 0 16 16" >
                            <path fillRule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                            />
                          </svg>
                        </button>

                        <button
                          className="action-btn"
                          title="Thêm vào giỏ"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCartHandler(product.MaSanPham);
                          }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            fill="currentColor"
                            className="bi bi-bag-fill"
                            viewBox="0 0 16 16">
                            <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <Link to={`/san-pham/${product.MaSanPham}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="product-info">
                        <span className="product-category">
                          {categories.find(
                            (c) => c.MaDanMuc === product.MaDanMuc
                          )?.TenDanMuc || "Không xác định"}
                        </span>
                        <h3 className="product-title">
                          {product.TenSanPham}
                        </h3>
                        <div className="product-price1">
                          <span className="current-price">
                            {formatPrice(product.Gia)}
                          </span>
                        </div>
                        <div className="product-meta">
                          <span className="product-rating">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
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
                ))
                }
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <ul className="page-numbers">
                    <li>
                      <button
                        title="d"
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
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
                    </li>

                    {pageNumbers.map(number => (
                      <li key={number}>
                        <button
                          onClick={() => paginate(number)}
                          className={currentPage === number ? "active" : ""}
                        >
                          {number}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        title="d"
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
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
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sanpham;