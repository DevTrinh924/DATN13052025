
import React, { useState, useEffect } from 'react';
import { getFavorites, deleteFavorite, getFavoriteDetail } from '../../services/api/YeuthichApi';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface Favorite {
  MaKhachHang: number;
  MaSanPham: number;
  HoTen: string;
  TenSanPham: string;
  Gia: number;
  Hinh: string;
  SanPhamHinh?: string;
  TenDanMuc: string;
  NgayThem: string;
  avatar?: string;
  KhachHangAvatar?: string;
  Size?: string;
  ChatLieu?: string;
  NoiDungChiTiet?: string;
}

const Yeuthich = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Favorite | null>(null);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Giới hạn 8 sản phẩm mỗi trang

  // Get token from localStorage
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Lọc danh sách yêu thích khi bộ lọc thay đổi
  useEffect(() => {
    let filtered = favorites;

    filtered = filtered.filter(favorite => {
      return (
        (filterCustomer === '' || favorite.MaKhachHang.toString() === filterCustomer) &&
        (filterProduct === '' || favorite.MaSanPham.toString() === filterProduct) &&
        (filterDate === '' || {
          'Hôm nay': new Date(favorite.NgayThem).toDateString() === new Date().toDateString(),
          'Tuần này': new Date(favorite.NgayThem) >= new Date(new Date().setDate(new Date().getDate() - 7)),
          'Tháng này': new Date(favorite.NgayThem).getMonth() === new Date().getMonth() &&
            new Date(favorite.NgayThem).getFullYear() === new Date().getFullYear()
        }[filterDate] || true)
      );
    });

    setFilteredFavorites(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [favorites, filterCustomer, filterProduct, filterDate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites(token);
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (customerId: number, productId: number) => {
    try {
      const detail = await getFavoriteDetail(`${customerId}-${productId}`, token);
      
      if (!detail) {
        console.error('No detail data returned from API');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không tìm thấy thông tin chi tiết sản phẩm',
        });
        return;
      }

      // Format lại dữ liệu trước khi hiển thị
      const formattedDetail: Favorite = {
        ...detail,
        Hinh: detail.Hinh
          ? `http://localhost:3000/uploads/${detail.Hinh}`
          : detail.SanPhamHinh
          ? `http://localhost:3000/uploads/${detail.SanPhamHinh}`
          : 'https://via.placeholder.com/300',
        KhachHangAvatar: detail.KhachHangAvatar
          ? `http://localhost:3000/uploads/${detail.KhachHangAvatar}`
          : 'https://via.placeholder.com/150',
      };

      setSelectedProduct(formattedDetail);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching favorite detail:", error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi khi lấy thông tin chi tiết. Vui lòng thử lại sau.',
      });
    }
  };

  const handleDelete = async (customerId: number, productId: number) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteFavorite(productId, token);
          await fetchFavorites();
          Swal.fire(
            'Đã xóa!',
            'Sản phẩm đã được xóa khỏi danh sách yêu thích.',
            'success'
          );
        } catch (error) {
          console.error("Error deleting favorite:", error);
          Swal.fire(
            'Lỗi!',
            'Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.',
            'error'
          );
        }
      }
    });
  };

  // Hàm xuất Excel
  const handleExportExcel = () => {
    const exportData = currentFavorites.map((favorite, index) => ({
      STT: indexOfFirstItem + index + 1,
      'Khách hàng': favorite.HoTen,
      'Sản phẩm': favorite.TenSanPham,
      'Giá': favorite.Gia.toLocaleString('vi-VN') + ' ₫',
      'Danh mục': favorite.TenDanMuc,
      'Ngày thêm': new Date(favorite.NgayThem).toLocaleDateString('vi-VN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachYeuThich');
    XLSX.writeFile(workbook, 'DanhSachYeuThich.xlsx');
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFavorites = filteredFavorites.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <div key={i} className="page-item">
          <a
            href="#"
            className={`page-link ${i === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </a>
        </div>
      );
    }
    return pages;
  };

  return (
    <>
      <div className="promotion-management">
        <div className="product-actions">
          <div className="filter-section">
            <h2 className="title">DANH SÁCH SẢN PHẨM YÊU THÍCH</h2>
            <div className="breadcrumbsp">
              <span className="breadcrumbsp-bold">Trang chủ</span>
              <span className="breadcrumbsp-separator">›</span>
              <span className="breadcrumbsp-current">Danh sách sản phẩm yêu thích</span>
            </div>
          </div>
          <div className="btn-sectiondm">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                onChange={(e) => {
                  setFilterProduct(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button type="button" className="button-search">
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </button>
            </div>
            <select
              title='Lọc theo khách hàng'
              className="filter-select"
              value={filterCustomer}
              onChange={(e) => {
                setFilterCustomer(e.target.value);
                setCurrentPage(1);
              }}
              style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
            >
              <option value="">Lọc theo khách hàng</option>
              {Array.from(new Set(favorites.map(f => f.MaKhachHang))).map(id => {
                const customer = favorites.find(f => f.MaKhachHang === id);
                return customer ? (
                  <option key={id} value={id}>{customer.HoTen}</option>
                ) : null;
              })}
            </select>
            <select
              title='Lọc theo sản phẩm'
              className="filter-select"
              value={filterProduct}
              onChange={(e) => {
                setFilterProduct(e.target.value);
                setCurrentPage(1);
              }}
              style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
            >
              <option value="">Lọc theo sản phẩm</option>
              {Array.from(new Set(favorites.map(f => f.MaSanPham))).map(id => {
                const product = favorites.find(f => f.MaSanPham === id);
                return product ? (
                  <option key={id} value={id}>{product.TenSanPham}</option>
                ) : null;
              })}
            </select>
            <select
              title='Lọc theo thời gian'
              className="filter-select"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
            >
              <option value="">Lọc theo thời gian</option>
              <option value="Hôm nay">Hôm nay</option>
              <option value="Tuần này">Tuần này</option>
              <option value="Tháng này">Tháng này</option>
            </select>
            <button className="btn btn-primary" onClick={handleExportExcel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.5 6a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.793z" />
                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
              </svg>
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Favorites Table */}
        <div className="product-table">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th style={{ width: 200 }}>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Ngày thêm</th>
                  <th>Danh mục</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentFavorites.length > 0 ? (
                  currentFavorites.map((favorite, index) => (
                    <tr key={`${favorite.MaKhachHang}-${favorite.MaSanPham}`}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        <div className="customer-info">
                          <img
                            src={favorite.avatar ? `http://localhost:3000/uploads/${favorite.avatar}` : 
                                 favorite.KhachHangAvatar ? `http://localhost:3000/uploads/${favorite.KhachHangAvatar}` : 
                                 'https://via.placeholder.com/150'}
                            alt="Customer"
                            className="customer-avatar"
                          />
                          <span>{favorite.HoTen}</span>
                        </div>
                      </td>
                      <td>{favorite.TenSanPham}</td>
                      <td>{favorite.Gia.toLocaleString('vi-VN')} ₫</td>
                      <td>{new Date(favorite.NgayThem).toLocaleDateString('vi-VN')}</td>
                      <td><span className="badge badge-info">{favorite.TenDanMuc}</span></td>
                      <td>
                        <button
                          className="view"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(favorite.MaKhachHang, favorite.MaSanPham)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                          </svg>
                        </button>
                        <button
                          className="btndm delete"
                          title="Xóa"
                          onClick={() => handleDelete(favorite.MaKhachHang, favorite.MaSanPham)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>
                      {filterCustomer || filterProduct || filterDate ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        <div className="pagination">
          <div className="page-item">
            <a
              href="#"
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
            </a>
          </div>
          {renderPagination()}
          <div className="page-item">
            <a
              href="#"
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>CHI TIẾT SẢN PHẨM YÊU THÍCH</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-bodyyt">
              <div className="product-detail-rowyt">
                <div className="product-detail-col" style={{ flex: '0 0 40%' }}>
                  <img 
                    src={selectedProduct.Hinh} 
                    alt={selectedProduct.TenSanPham}
                    className="product-detail-imgyt"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                </div>
                <div className="product-detail-col" style={{ flex: '0 0 60%' }}>
                  <div className="product-detail-groupyt">
                    <label>Tên sản phẩm:</label>
                    <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedProduct.TenSanPham}</p>
                  </div>
                  <div className="product-detail-groupyt">
                    <label>Khách hàng:</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={selectedProduct.KhachHangAvatar} 
                        alt={selectedProduct.HoTen}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                      <span>{selectedProduct.HoTen}</span>
                    </div>
                  </div>
                  <div className="product-detail-groupyt">
                    <label>Danh mục:</label>
                    <p><span className="badge badge-info">{selectedProduct.TenDanMuc}</span></p>
                  </div>
                  <div className="product-detail-groupyt">
                    <label>Giá:</label>
                    <p style={{ color: '#d70018', fontWeight: 'bold' }}>{selectedProduct.Gia.toLocaleString('vi-VN')} ₫</p>
                  </div>
                  {selectedProduct.Size && (
                    <div className="product-detail-groupyt">
                      <label>Kích thước:</label>
                      <p>{selectedProduct.Size}</p>
                    </div>
                  )}
                  {selectedProduct.ChatLieu && (
                    <div className="product-detail-groupyt">
                      <label>Chất liệu:</label>
                      <p>{selectedProduct.ChatLieu}</p>
                    </div>
                  )}
                  <div className="product-detail-groupyt">
                    <label>Ngày thêm:</label>
                    <p>{new Date(selectedProduct.NgayThem).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
              {selectedProduct.NoiDungChiTiet && (
                <div className="product-detail-groupyt" style={{ marginTop: '20px' }}>
                  <label>Mô tả chi tiết:</label>
                  <div dangerouslySetInnerHTML={{ __html: selectedProduct.NoiDungChiTiet }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Yeuthich;
