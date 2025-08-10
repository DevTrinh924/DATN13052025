import { useEffect, useState } from 'react';
import { getCategories, deleteCategory, updateCategory, createCategory } from '../../services/api/categoryApi';
import "../../assets/styles/Categories.css";
import Swal from 'sweetalert2';

type Category = {
  MaDanMuc: number;
  TenDanMuc: string;
  hinh_dm: string;
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // State để theo dõi trang hiện tại
  const itemsPerPage = 8; // Giới hạn 8 danh mục mỗi trang
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null as number | null,
    TenDanMuc: '',
    hinh_dm: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(c =>
      c.TenDanMuc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Lỗi tải danh sách danh mục:', error);
      setError('Lỗi tải danh sách danh mục. Vui lòng thử lại.');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải danh sách danh mục. Vui lòng thử lại!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setFormData(prev => ({
      ...prev,
      hinh_dm: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('TenDanMuc', formData.TenDanMuc);

      if (avatarFile) {
        formDataToSend.append('hinh_dm', avatarFile);
      } else if (formData.hinh_dm) {
        formDataToSend.append('hinh_dm', formData.hinh_dm);
      }

      if (formData.id) {
        await updateCategory(formData.id, formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật danh mục thành công!',
        });
      } else {
        await createCategory(formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thêm danh mục thành công!',
        });
      }

      await fetchCategories();
      setShowForm(false);
      resetForm();

    } catch (error: any) {
      console.error('Error saving category:', error);
      setError(error.message || 'Error saving category. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, TenDanMuc: '', hinh_dm: '' });
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      id: category.MaDanMuc,
      TenDanMuc: category.TenDanMuc,
      hinh_dm: category.hinh_dm
    });

    if (category.hinh_dm) {
      setAvatarPreview(category.hinh_dm);
    } else {
      setAvatarPreview(null);
    }

    setAvatarFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await deleteCategory(id);
        await fetchCategories();
        // Nếu trang hiện tại không còn danh mục sau khi xóa, chuyển về trang trước
        if (filteredCategories.length <= (currentPage - 1) * itemsPerPage + 1) {
          setCurrentPage(prev => Math.max(prev - 1, 1));
        }
        Swal.fire(
          'Đã xóa!',
          'Danh mục đã được xóa thành công.',
          'success'
        );
      } catch (error) {
        console.error('Error deleting:', error);
        setError('Error deleting category');
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể xóa danh mục. Vui lòng thử lại!',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Tính toán danh mục hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Tạo danh sách các trang để hiển thị
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      {!showForm && (
        <div id="categoryListSection">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">QUẢN LÝ DANH MỤC</h2>
              <div className="breadcrumbdm">
                <span className="breadcrumbdm-bold">Trang chủ</span>
                <span className="breadcrumbdm-separator">›</span>
                <span className="breadcrumbdm-current">Danh sách danh mục</span>
              </div>
            </div>
            <div className="btn-sectiondm">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Nhập tên danh mục..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button type="button" className="button-search" title='F'>
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </button>
              </div>
              <button
                className="btndm btndm-primary"
                onClick={() => setShowForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
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
                  <th style={{ width: 200 }}>Hinh ảnh</th>
                  <th style={{ textAlign: "left" }}>Tên danh mục</th>
                  <th style={{ width: 255 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((category, index) => (
                  <tr key={category.MaDanMuc}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <img
                        src={category.hinh_dm || '/default-product.jpg'}
                        alt={category.TenDanMuc}
                        className="avatar-img"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                          target.onerror = null;
                        }}
                        style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ textAlign: "left" }}>{category.TenDanMuc}</td>
                    <td style={{ width: 255, textAlign: "center" }}>
                      <button
                        title='Chỉnh sửa'
                        className="edit"
                        onClick={() => handleEdit(category)}
                        style={{ marginRight: "10px" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                        </svg>
                      </button>
                      <button
                        title='Xóa'
                        className="delete"
                        onClick={() => handleDelete(category.MaDanMuc)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <div className="page-item">
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                </svg>
              </button>
            </div>
            {pageNumbers.map(number => (
              <div className="page-item" key={number}>
                <button
                  className={`page-link ${currentPage === number ? 'active' : ''}`}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              </div>
            ))}
            <div className="page-item">
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="add-form">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">{formData.id ? " CẬP NHẬT" : "THÊM"} DANH MỤC</h2>
              <div className="breadcrumbdm">
                <span className="breadcrumbdm-bold">Danh mục danh sách </span>
                <span className="breadcrumbdm-separator">›</span>
                <span className="breadcrumbdm-current">{formData.id ? "cập nhật danh mục" : "thêm danh mục"}</span>
              </div>
            </div>
            <div className="btn-sectiondm">
              <button
                className="back-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
                  <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
                </svg>
                Thoát
              </button>
            </div>
          </div>

          <div className="cover-form">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label className="labelName">Hinh ảnh :</label>
                    {avatarPreview ? (
                      <div className="image-preview-dm">
                        <img src={avatarPreview} alt="Preview"
                          className="preview-imagedm"
                        />
                        <button type="button" className="btn btn-danger button-btn " onClick={removeAvatar}>
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 0 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                          </svg>
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload-dm">
                        <label htmlFor="productImage" className="image-upload-label">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0" />
                          </svg>
                          <p>Nhấn để tải lên hình ảnh</p>
                          <input type="file" id="productImage" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="categoryName" className="labelName">Tên danh mục:</label>
                    <input
                      type="text"
                      id="categoryName"
                      name="TenDanMuc"
                      className="form-control"
                      value={formData.TenDanMuc}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <div className="form-footer">
                <button type="button" className="btndm btn-danger" onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}>
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
                  <span>Hủy</span>
                </button>
                <button type="submit" className="btndm btndm-primary" disabled={isLoading}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-send"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                  </svg>
                  <span>{formData.id ? 'Cập nhật danh mục' : 'Lưu danh mục'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;