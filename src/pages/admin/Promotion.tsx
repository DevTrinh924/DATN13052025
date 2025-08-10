import { useState, useEffect } from "react";
import "../../assets/styles/Promotion.css";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../../services/api/PromotionApi";
import { getCategories } from "../../services/api/categoryApi";
import { getProducts } from "../../services/api/ProductsApi";
import * as XLSX from 'xlsx'; // Thư viện để xuất Excel
import Swal from 'sweetalert2';

interface Promotion {
  MaKhuyenMai?: number;
  TenKhuyenMai: string;
  MoTa?: string;
  hinh_TM?: string | File;
  PhanTramGiam: number;
  MaVoucher?: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  DieuKienApDung?: string;
  TrangThai?: 'dang_ap_dung' | 'da_ket_thuc' | 'chua_bat_dau';
}

interface Filters {
  search: string;
  status: string;
  sort: 'newest' | 'oldest' | 'start_date' | 'end_date' | '';
}

const Promotion = () => {
  // State quản lý dữ liệu
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(8); // Giới hạn 8 khuyến mãi mỗi trang

  // State cho form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Promotion>({
    TenKhuyenMai: '',
    MoTa: '',
    PhanTramGiam: 0,
    NgayBatDau: '',
    NgayKetThuc: '',
    TrangThai: 'chua_bat_dau',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State cho filter
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    sort: ''
  });

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPromotions();
  }, []);

  // Lọc khuyến mãi khi filter thay đổi
  useEffect(() => {
    let filtered = promotions;

    // Lọc theo tìm kiếm
    if (filters.search) {
      filtered = filtered.filter(p =>
        p.TenKhuyenMai.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (filters.status) {
      filtered = filtered.filter(p => p.TrangThai === filters.status);
    }

    // Sắp xếp
    if (filters.sort) {
      filtered = [...filtered].sort((a, b) => {
        if (filters.sort === 'newest') {
          return (b.MaKhuyenMai || 0) - (a.MaKhuyenMai || 0);
        } else if (filters.sort === 'oldest') {
          return (a.MaKhuyenMai || 0) - (b.MaKhuyenMai || 0);
        } else if (filters.sort === 'start_date') {
          return new Date(a.NgayBatDau).getTime() - new Date(b.NgayBatDau).getTime();
        } else if (filters.sort === 'end_date') {
          return new Date(a.NgayKetThuc).getTime() - new Date(b.NgayKetThuc).getTime();
        }
        return 0;
      });
    }

    setFilteredPromotions(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [filters, promotions]);

  // Fetch danh sách khuyến mãi
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await getPromotions(filters);
      setPromotions(Array.isArray(data) ? data : []);
      setFilteredPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải khuyến mãi:', error);
      setPromotions([]);
      setFilteredPromotions([]);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải danh sách khuyến mãi. Vui lòng thử lại!',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      setProducts([]);
    }
  };

  // Fetch danh sách danh mục
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
      setCategories([]);
    }
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Toggle hiển thị form
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      resetForm();
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'PhanTramGiam' ? Number(value) : value
    });
  };

  // Xử lý thay đổi file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, hinh_TM: file });
    }
  };

  // Xóa ảnh
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData({ ...formData, hinh_TM: undefined });
  };

  // Xử lý chọn danh mục
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(Number(options[i].value));
      }
    }
    setFormData({
      ...formData,
    });
  };

  // Xử lý chọn sản phẩm
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(Number(options[i].value));
      }
    }
    setFormData({
      ...formData,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      TenKhuyenMai: '',
      MoTa: '',
      PhanTramGiam: 0,
      NgayBatDau: '',
      NgayKetThuc: '',
      TrangThai: 'chua_bat_dau',
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingId(null);
  };

  // Xử lý edit
  const handleEdit = (promotion: Promotion) => {
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFormData({
      ...promotion,
      NgayBatDau: formatDateForInput(promotion.NgayBatDau),
      NgayKetThuc: formatDateForInput(promotion.NgayKetThuc),
    });

    setImagePreview(promotion.hinh_TM && typeof promotion.hinh_TM === 'string'
      ? `http://localhost:3000/uploads/${promotion.hinh_TM}`
      : null);
      
    setEditingId(promotion.MaKhuyenMai || null);
    setShowForm(true);
  };

  // Xử lý xóa
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa!',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await deletePromotion(id);
        await Swal.fire(
          'Đã xóa!',
          'Khuyến mãi đã được xóa thành công.',
          'success'
        );
        fetchPromotions();
      } catch (error) {
        console.error('Lỗi xóa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể xóa khuyến mãi. Vui lòng thử lại!',
        });
      }
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!formData.TenKhuyenMai || !formData.NgayBatDau || !formData.NgayKetThuc) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng nhập tên khuyến mãi và ngày bắt đầu/kết thúc!',
      });
      return;
    }

    if (new Date(formData.NgayBatDau) > new Date(formData.NgayKetThuc)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Ngày kết thúc phải sau ngày bắt đầu!',
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append all fields
      formDataToSend.append("TenKhuyenMai", formData.TenKhuyenMai);
      formDataToSend.append("PhanTramGiam", formData.PhanTramGiam.toString());
      formDataToSend.append("NgayBatDau", formData.NgayBatDau);
      formDataToSend.append("NgayKetThuc", formData.NgayKetThuc);
      formDataToSend.append("TrangThai", formData.TrangThai || 'chua_bat_dau');
      
      // Append optional fields if they exist
      if (formData.MoTa) formDataToSend.append("MoTa", formData.MoTa);
      if (formData.MaVoucher) formDataToSend.append("MaVoucher", formData.MaVoucher);
      if (formData.DieuKienApDung) formDataToSend.append("DieuKienApDung", formData.DieuKienApDung);
      
      // Append image only if it exists
      if (imageFile) {
        formDataToSend.append("hinh_TM", imageFile);
      } else if (!imagePreview && editingId) {
        formDataToSend.append("hinh_TM", "");
      }

      if (editingId) {
        await updatePromotion(editingId, formDataToSend);
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật khuyến mãi thành công!',
        });
      } else {
        await createPromotion(formDataToSend);
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Thêm khuyến mãi mới thành công!',
        });
      }
      
      // Reset and refresh
      setShowForm(false);
      resetForm();
      fetchPromotions();
    } catch (error: any) {
      console.error('Lỗi khi lưu khuyến mãi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu khuyến mãi. Vui lòng thử lại.',
      });
    }
  };

  // Hàm xuất Excel
  const handleExportExcel = () => {
    const exportData = currentPromotions.map((promotion, index) => ({
      STT: indexOfFirstItem + index + 1,
      'Tên chương trình': promotion.TenKhuyenMai,
      'Mô tả': promotion.MoTa || '',
      'Phần trăm giảm': `${promotion.PhanTramGiam}%`,
      'Mã voucher': promotion.MaVoucher || '',
      'Ngày bắt đầu': formatDate(promotion.NgayBatDau),
      'Ngày kết thúc': formatDate(promotion.NgayKetThuc),
      'Trạng thái': 
        promotion.TrangThai === 'dang_ap_dung' ? 'Đang áp dụng' :
        promotion.TrangThai === 'chua_bat_dau' ? 'Chưa bắt đầu' :
        promotion.TrangThai === 'da_ket_thuc' ? 'Đã kết thúc' : 'Không xác định'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachKhuyenMai');
    XLSX.writeFile(workbook, 'DanhSachKhuyenMai.xlsx');
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <>
      {/* Promotion List */}
      {!showForm && (
        <div className="promotion-management">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">DANH SÁCH KHUYẾN MÃI</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold"> Trang chủ</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh sách khuyến mãi</span>
              </div>
            </div>
            <div className="btn-sectionkm">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <button
                  type="button"
                  className="button-search"
                  onClick={fetchPromotions}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </button>
              </div>
              <select
                className="filter-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd"  }} 
              >
                <option value="">Tất cả trạng thái</option>
                <option value="dang_ap_dung">Đang áp dụng</option>
                <option value="chua_bat_dau">Chưa bắt đầu</option>
                <option value="da_ket_thuc">Đã kết thúc</option>
              </select>
              <select
                className="filter-select"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd"  }} 
              >
                <option value="">Sắp xếp theo</option>
                <option value="newest">Ngày tạo mới nhất</option>
                <option value="oldest">Ngày tạo cũ nhất</option>
                <option value="start_date">Ngày bắt đầu</option>
                <option value="end_date">Ngày kết thúc</option>
              </select>
              <button
                className="btn btn-primary"
                onClick={handleExportExcel}
              >
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
              <button
                className="btn btn-primary"
                id="addProductBtn"
                onClick={toggleForm}
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
                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                  />
                </svg>
                Thêm khuyến mãi
              </button>
            </div>
          </div>
          {/* Promotion Table */}
          <div className="product-table">
            <table className="table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Hình ảnh</th>
                  <th>Tên chương trình</th>
                  <th>Mô tả</th>
                  <th>Giảm giá</th>
                  <th>Mã voucher</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentPromotions.length > 0 ? (
                  currentPromotions.map((promotion, index) => (
                    <tr key={promotion.MaKhuyenMai}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        <img
                          src={
                            promotion.hinh_TM && typeof promotion.hinh_TM === 'string'
                              ? `http://localhost:3000/uploads/${promotion.hinh_TM}`
                              : '/default-promo.jpg'
                          }
                          alt=""
                          className="product-img-db"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-promo.jpg';
                          }}
                        />
                      </td>
                      <td>{promotion.TenKhuyenMai}</td>
                      <td>{promotion.MoTa}</td>
                      <td>{promotion.PhanTramGiam}%</td>
                      <td>{promotion.MaVoucher}</td>
                      <td>{formatDate(promotion.NgayBatDau)}</td>
                      <td>{formatDate(promotion.NgayKetThuc)}</td>
                      <td>
                        {promotion.TrangThai === "dang_ap_dung" && "Đang áp dụng"}
                        {promotion.TrangThai === "chua_bat_dau" && "Chưa bắt đầu"}
                        {promotion.TrangThai === "da_ket_thuc" && "Đã kết thúc"}
                      </td>
                      <td style={{ width: 250, textAlign: "center" }}>
                        <button
                          className="edit"
                          title="Sửa"
                          style={{ marginRight: "10px" }}
                          onClick={() => handleEdit(promotion)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16" >
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                          </svg>
                        </button>
                        <button
                          className="delete"
                          title="Xóa"
                          onClick={() => promotion.MaKhuyenMai && handleDelete(promotion.MaKhuyenMai)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={20}
                            height={20}
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
                    <td colSpan={10} style={{ textAlign: 'center' }}>
                      {filters.search || filters.status ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
      )}
      {/* Promotion Form */}
      {showForm && (
        <div className="add-form">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">
                {editingId ? "CẬP NHẬT KHUYẾN MÃI" : "THÊM KHUYẾN MÃI"}
              </h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Danh sách khuyến mãi</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">
                  {editingId ? "Cập nhật" : "Thêm mới"} khuyến mãi
                </span>
              </div>
            </div>
            <div className="btn-sectionkm">
              <button className="back-btn" onClick={toggleForm}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"
                  />
                  <path
                    fillRule="evenodd"
                    d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"
                  />
                </svg>
                Quay lại
              </button>
            </div>
          </div>
          <div className="cover-form">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="promotionName" className="form-label">
                      Tên chương trình:
                    </label>
                    <input
                      type="text"
                      id="promotionName"
                      name="TenKhuyenMai"
                      className="form-control"
                      placeholder="Nhập tên chương trình"
                      value={formData.TenKhuyenMai}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="promotionDescription" className="form-label">
                      Mô tả
                    </label>
                    <textarea
                      id="promotionDescription"
                      name="MoTa"
                      className="form-control"
                      rows={1}
                      placeholder="Nhập mô tả khuyến mãi"
                      value={formData.MoTa}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="startDate" className="form-label">
                      Ngày bắt đầu*
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="NgayBatDau"
                      className="form-control"
                      value={formData.NgayBatDau}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate" className="form-label">
                      Ngày kết thúc*
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="NgayKetThuc"
                      className="form-control"
                      value={formData.NgayKetThuc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label className="form-label">Hình ảnh khuyến mãi</label>
                    {imagePreview ? (
                      <div className="avatar-preview">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="preview-avatar"
                          onClick={() => document.getElementById("clientAvatar")?.click()}
                        />
                        <button
                          type="button"
                          className="btn btn-danger button-btn"
                          onClick={removeImage}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                          </svg>
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <div className="avatar-upload">
                        <label htmlFor="clientAvatar" className="avatar-upload-label">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0"/>
                          </svg>
                          <p>Chọn hình ảnh</p>
                          <input
                            type="file"
                            id="clientAvatar"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="discountValue" className="form-label">
                      Phần trăm giảm giá:
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      name="PhanTramGiam"
                      className="form-control"
                      placeholder="1-100%"
                      min={1}
                      max={100}
                      value={formData.PhanTramGiam}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Trạng thái:
                    </label>
                    <select
                      id="status"
                      name="TrangThai"
                      className="form-control"
                      value={formData.TrangThai}
                      onChange={handleInputChange}
                    >
                      <option value="chua_bat_dau">Chưa bắt đầu</option>
                      <option value="dang_ap_dung">Đang áp dụng</option>
                      <option value="da_ket_thuc">Đã kết thúc</option>
                    </select>
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="voucherCode" className="form-label">
                      Mã voucher
                    </label>
                    <input
                      type="text"
                      id="voucherCode"
                      name="MaVoucher"
                      className="form-control"
                      value={formData.MaVoucher || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="condition" className="form-label">
                  Điều kiện áp dụng
                </label>
                <textarea
                  id="condition"
                  name="DieuKienApDung"
                  className="form-control"
                  rows={3}
                  placeholder="Nhập điều kiện áp dụng khuyến mãi"
                  value={formData.DieuKienApDung || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-footer">
                <button
                  type="button"
                  className="btnsp btnsp-danger"
                  onClick={toggleForm}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btnsp btnsp-primary">
                  {editingId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Promotion;