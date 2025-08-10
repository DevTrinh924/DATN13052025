import { useState, useEffect } from 'react';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/api/CategorieNewApi';
import * as XLSX from 'xlsx'; // Thư viện để xuất Excel
import "../../assets/styles/Order.css";
import "../../assets/styles/Dashboard.css";
import Swal from 'sweetalert2';

interface Category {
  MaDanMucTT: number;
  TenDanMucTT: string;
}

const CategorieNew = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    MaDanMucTT: null as number | null,
    TenDanMucTT: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [itemsPerPage] = useState(8); // Giới hạn 8 danh mục mỗi trang

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.TenDanMucTT.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể tải danh sách danh mục',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = async (category: Category) => {
    try {
      const categoryData = await getCategoryById(category.MaDanMucTT);
      setFormData({
        MaDanMucTT: categoryData.MaDanMucTT,
        TenDanMucTT: categoryData.TenDanMucTT
      });
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching category:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể tải thông tin danh mục',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.MaDanMucTT) {
        await updateCategory(formData.MaDanMucTT, formData.TenDanMucTT);
        Swal.fire({
          title: 'Thành công!',
          text: 'Cập nhật danh mục thành công',
          icon: 'success',
          confirmButtonText: 'Đóng'
        });
      } else {
        await createCategory(formData.TenDanMucTT);
        Swal.fire({
          title: 'Thành công!',
          text: 'Thêm danh mục thành công',
          icon: 'success',
          confirmButtonText: 'Đóng'
        });
      }
      fetchCategories();
      setShowForm(false);
      setFormData({ MaDanMucTT: null, TenDanMucTT: '' });
    } catch (error) {
      console.error('Error saving category:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi lưu danh mục',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn có chắc chắn muốn xóa danh mục này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    });

    if (!result.isConfirmed) return;
    
    try {
      await deleteCategory(id);
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Xóa danh mục thành công',
        icon: 'success',
        confirmButtonText: 'Đóng'
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi xóa danh mục',
        icon: 'error',
        confirmButtonText: 'Đóng'
      });
    }
  };

  // Hàm xuất Excel
  const handleExportExcel = () => {
    const exportData = currentCategories.map((category, index) => ({
      STT: indexOfFirstItem + index + 1,
      'Tên danh mục': category.TenDanMucTT,
      'Mã danh mục': category.MaDanMucTT
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhMucTinTuc');
    XLSX.writeFile(workbook, 'DanhMucTinTuc.xlsx');
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

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

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      {!showForm && (
        <div id="categoryListSection">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">DANH SÁCH DANH MỤC TIN TỨC</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Trang chủ</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh mục tin tức</span>
              </div>
            </div>
            <div className="btn-sectiondm">
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
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
                onClick={() => setShowForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                Thêm danh mục
              </button>
            </div>
          </div>
          <div className="product-table">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th style={{ textAlign: 'left' }}>Tên danh mục</th>
                  <th style={{ width: 300 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.length > 0 ? (
                  currentCategories.map((category, index) => (
                    <tr key={`${category.MaDanMucTT}-${index}`}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td style={{ textAlign: 'left' }}>{category.TenDanMucTT}</td>
                      <td>
                        <button 
                          className="btndm edit" 
                          title="Sửa" 
                          onClick={() => handleEdit(category)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                          </svg>
                        </button>
                        <button 
                          className="btndm delete" 
                          title="Xóa" 
                          onClick={() => handleDelete(category.MaDanMucTT)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
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
              <h2 className="title" id="categoryFormTitle">
                {formData.MaDanMucTT ? 'CẬP NHẬT DANH MỤC' : 'THÊM DANH MỤC MỚI'}
              </h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Tin tức</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh mục tin tức</span>
              </div>
            </div>
            <div className="btn-sectiondm">
              <button 
                className="back-btn" 
                onClick={() => {
                  setShowForm(false);
                  setFormData({ MaDanMucTT: null, TenDanMucTT: '' });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                  <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                </svg>
                Quay lại
              </button>
            </div>
          </div>
          <div className="cover-form">
            <form id="categoryFormData" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="categoryName" className="labelName">
                  Tên danh mục:
                </label>
                <input
                  type="text"
                  id="categoryName"
                  name="TenDanMucTT"
                  className="form-control"
                  value={formData.TenDanMucTT}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-footer">
                <button
                  type="button"
                  className="btnsp btnsp-danger"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ MaDanMucTT: null, TenDanMucTT: '' });
                  }}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btnsp btnsp-primary">
                  {formData.MaDanMucTT ? 'Cập nhật' : 'Thêm'} danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CategorieNew;