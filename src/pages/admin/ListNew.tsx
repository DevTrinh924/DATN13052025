import { useEffect, useState } from 'react';
import { getNews, createNews, updateNews, deleteNews, getNewsCategories } from '../../services/api/ListNewApi';
import * as XLSX from 'xlsx'; // Thư viện để xuất Excel
import "../../assets/styles/Products.css";
import Swal from 'sweetalert2';

interface News {
  MaTinTuc?: number;
  TieuDe: string;
  MoTaNgan: string;
  Hinh: string;
  NoiDungChiTiet: string;
  MaDanMucTT: number;
  TenDanMucTT?: string;
}

interface Category {
  MaDanMucTT: number;
  TenDanMucTT: string;
}

const ListNew = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<News>({
    TieuDe: '',
    MoTaNgan: '',
    Hinh: '',
    NoiDungChiTiet: '',
    MaDanMucTT: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(8); // Giới hạn 8 tin tức mỗi trang

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = newsList.filter(n =>
      n.TieuDe.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNews(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [searchTerm, newsList]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getNews();
      setNewsList(data);
      setFilteredNews(data);
      setError('');
    } catch (error) {
      setError('Không thể tải danh sách tin tức');
      console.error('Lỗi tải tin tức:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải danh sách tin tức',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getNewsCategories();
      setCategories(data);
      if (data.length > 0 && !formData.MaDanMucTT) {
        setFormData(prev => ({ ...prev, MaDanMucTT: data[0].MaDanMucTT }));
      }
    } catch (error) {
      console.error('Lỗi tải danh mục tin tức:', error);
      setError('Không thể tải danh mục tin tức');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải danh mục tin tức',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'MaDanMucTT' ? Number(value) : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.match('image.*')) {
        setError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)',
          confirmButtonText: 'Đóng'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file tối đa là 5MB');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Kích thước file tối đa là 5MB',
          confirmButtonText: 'Đóng'
        });
        return;
      }

      setImageFile(file);

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData({
        ...formData,
        Hinh: file.name
      });
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData({ ...formData, Hinh: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('TieuDe', formData.TieuDe);
      formDataToSend.append('MoTaNgan', formData.MoTaNgan);
      formDataToSend.append('NoiDungChiTiet', formData.NoiDungChiTiet);
      formDataToSend.append('MaDanMucTT', formData.MaDanMucTT.toString());

      if (imageFile) {
        formDataToSend.append('Hinh', imageFile);
      }

      if (formData.MaTinTuc) {
        await updateNews(formData.MaTinTuc, formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật tin tức thành công',
          confirmButtonText: 'Đóng'
        });
      } else {
        await createNews(formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm tin tức mới thành công',
          confirmButtonText: 'Đóng'
        });
      }

      await fetchNews();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Lỗi lưu tin tức:', error);
      setError('Có lỗi xảy ra khi lưu tin tức');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi lưu tin tức',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      TieuDe: '',
      MoTaNgan: '',
      Hinh: '',
      NoiDungChiTiet: '',
      MaDanMucTT: categories.length > 0 ? categories[0].MaDanMucTT : 0
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleEdit = (news: News) => {
    setFormData(news);
    setImagePreview(news.Hinh ? news.Hinh : null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn có chắc chắn muốn xóa tin tức này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteNews(id);
        await fetchNews();
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Tin tức đã được xóa thành công.',
          confirmButtonText: 'Đóng'
        });
      } catch (error) {
        console.error('Lỗi xóa:', error);
        setError('Có lỗi xảy ra khi xóa tin tức');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi xóa tin tức',
          confirmButtonText: 'Đóng'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Hàm xuất Excel
  const handleExportExcel = () => {
    const exportData = currentNews.map((news, index) => ({
      STT: indexOfFirstItem + index + 1,
      'Tiêu đề': news.TieuDe,
      'Danh mục': categories.find(c => c.MaDanMucTT === news.MaDanMucTT)?.TenDanMucTT || 'Không xác định',
      'Mô tả ngắn': news.MoTaNgan,
      'Hình ảnh': news.Hinh
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachTinTuc');
    XLSX.writeFile(workbook, 'DanhSachTinTuc.xlsx');
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

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

  if (loading && !showForm) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      {!showForm && (
        <div id="productListSection">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">DANH SÁCH TIN TỨC</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Trang chủ </span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh sách tin tức</span>
              </div>
            </div>
            <div className="btn-sectiondm">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="button" className="button-search">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </button>
              </div>
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
                id="addCategoryBtn"
                onClick={() => setShowForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
                Thêm tin tức
              </button>
            </div>
          </div>
          <div className="product-table">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th style={{ width: 140 }}>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentNews.length > 0 ? (
                  currentNews.map((news, index) => (
                    <tr key={news.MaTinTuc}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        {news.Hinh && (
                          <img
                            src={news.Hinh}
                            alt={news.TieuDe}
                            className="product-img"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                               const target = e.target as HTMLImageElement;
                                target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                                target.onerror = null;
                            }}
                          />
                        )}
                      </td>
                      <td>{news.TieuDe}</td>
                      <td>
                        {categories.find(c => c.MaDanMucTT === news.MaDanMucTT)?.TenDanMucTT || 'Không xác định'}
                      </td>
                      <td style={{ width: 250, textAlign: "center" }}>
                        <button
                          className="edit"
                          title="Sửa"
                          onClick={() => handleEdit(news)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                          </svg>
                        </button>
                        <button
                          className="delete"
                          title="Xóa"
                          onClick={() => news.MaTinTuc && handleDelete(news.MaTinTuc)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                      {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <div className="page-item">
              <a
                href="#"
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
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
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="add-form" id="addCategoryForm">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title" id="newsFormTitle">
                {formData.MaTinTuc ? 'CHỈNH SỬA TIN TỨC' : 'THÊM TIN TỨC MỚI'}
              </h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Tin tức</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">
                  {formData.MaTinTuc ? 'Chỉnh sửa tin tức' : 'Thêm tin tức'}
                </span>
              </div>
            </div>
            <div className="btn-sectiondm">
              <button
                className="back-btn"
                id="backToCategoryList"
                onClick={() => setShowForm(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="currentColor" className="bi bi-box-arrow-left" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
                  <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
                </svg>
                Quay lại
              </button>
            </div>
          </div>
          <div className="cover-form">
            <form id="productForm" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="productName" className="labelName">Tiêu đề: </label>
                    <input
                      type="text"
                      id="productName"
                      className="form-control"
                      placeholder="Nhập tiêu đề tin tức"
                      name="TieuDe"
                      value={formData.TieuDe}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newsCategory" className="labelName">Danh mục: </label>
                    <select
                      id="newsCategory"
                      className="form-control"
                      name="MaDanMucTT"
                      value={formData.MaDanMucTT}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.MaDanMucTT} value={category.MaDanMucTT}>
                          {category.TenDanMucTT}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newsShortDesc" className="labelName">Mô tả ngắn: </label>
                    <textarea
                      id="newsShortDesc"
                      className="form-control"
                      rows={6}
                      name="MoTaNgan"
                      value={formData.MoTaNgan}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label className="labelName">Hình ảnh tin tức *</label>
                    {imagePreview ? (
                      <div className="avatar-preview">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="preview-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
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
                          <p>Nhấn để tải lên ảnh đại diện</p>
                          <input
                            type="file"
                            id="clientAvatar"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="newsContent" className="labelName">Nội dung chi tiết:</label>
                <textarea
                  id="newsContent"
                  className="form-control"
                  rows={5}
                  name="NoiDungChiTiet"
                  value={formData.NoiDungChiTiet}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-footer">
                <button
                  type="button"
                  className="btnsp btnsp-danger"
                  id="cancelAddCategory"
                  onClick={() => setShowForm(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btnsp btnsp-primary" disabled={loading}>
                  {loading ? 'Đang xử lý...' : formData.MaTinTuc ? 'Cập nhật' : 'Lưu tin tức'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ListNew;