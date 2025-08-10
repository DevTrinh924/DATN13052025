import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api/ProductsApi';
import { getCategories } from '../../services/api/categoryApi';
import "../../assets/styles/Products.css";
import Swal from 'sweetalert2';

// Định nghĩa kiểu dữ liệu cho sản phẩm
interface Product {
  MaSanPham?: number;
  TenSanPham: string;
  Gia: number;
  Hinh: string;
  SoLuong: number;
  MoTaNgan: string;
  Size: string;
  PhanLoai: 'Nam' | 'Nữ' | 'Unisex';
  ChatLieu: string;
  NoiDungChiTiet: string;
  MaDanMuc: number;
  TenDanMuc?: string;
}

const Products = () => {
  // State quản lý dữ liệu
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // State để theo dõi trang hiện tại
  const itemsPerPage = 8; // Giới hạn 8 sản phẩm mỗi trang
  const [formData, setFormData] = useState<Product>({
    TenSanPham: '',
    Gia: 0,
    Hinh: '',
    SoLuong: 0,
    MoTaNgan: '',
    Size: '',
    PhanLoai: 'Unisex',
    ChatLieu: '',
    NoiDungChiTiet: '',
    MaDanMuc: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p =>
      p.TenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || p.MaDanMuc.toString() === selectedCategory)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data as Product[]);
      setFilteredProducts(data as Product[]);
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
      setProducts([]);
      setFilteredProducts([]);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải danh sách sản phẩm',
        confirmButtonText: 'OK'
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải danh sách danh mục',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'Gia' || name === 'SoLuong' || name === 'MaDanMuc'
        ? Number(value)
        : value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData({ ...formData, Hinh: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'Hinh') {
          formDataToSend.append(key, String(formData[key as keyof Product]));
        }
      });

      if (imageFile) {
        formDataToSend.append('Hinh', imageFile);
      }

      if (formData.MaSanPham) {
        await updateProduct(formData.MaSanPham, formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Sản phẩm đã được cập nhật',
          confirmButtonText: 'OK'
        });
      } else {
        await createProduct(formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Sản phẩm đã được thêm mới',
          confirmButtonText: 'OK'
        });
      }

      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Lỗi lưu sản phẩm:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể lưu sản phẩm',
        confirmButtonText: 'OK'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      TenSanPham: '',
      Gia: 0,
      Hinh: '',
      SoLuong: 0,
      MoTaNgan: '',
      Size: '',
      PhanLoai: 'Unisex',
      ChatLieu: '',
      NoiDungChiTiet: '',
      MaDanMuc: 0
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setImagePreview(product.Hinh ? `http://localhost:3000${product.Hinh}` : null);
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
      try {
        await deleteProduct(id);
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Sản phẩm đã được xóa.',
          confirmButtonText: 'OK'
        });
        fetchProducts();
        // Nếu trang hiện tại không còn sản phẩm sau khi xóa, chuyển về trang trước
        if (filteredProducts.length <= (currentPage - 1) * itemsPerPage + 1) {
          setCurrentPage(prev => Math.max(prev - 1, 1));
        }
      } catch (error) {
        console.error('Lỗi xóa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể xóa sản phẩm',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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
        <div id="productListSection">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">DANH SÁCH SẢN PHẨM</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Trang chủ</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh sách sản phẩm</span>
              </div>
            </div>
            <div className="btn-sectionsp">
              <div className="search-bar">
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button type="submit" className="button-search">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </button>
              </div>
              <select title='filter by category' value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}>
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.MaDanMuc} value={category.MaDanMuc.toString()}>
                    {category.TenDanMuc}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                id="addProductBtn"
                onClick={() => setShowForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                </svg>
                Thêm sản phẩm
              </button>
            </div>
          </div>

          <div className="product-table">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th style={{ width: 200 }}>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Phân loại</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((product, index) => (
                  <tr key={product.MaSanPham}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <img
                        src={product.Hinh ? `http://localhost:3000${product.Hinh}` : '/default-product.jpg'}
                        alt={product.TenSanPham}
                        className="product-img-db"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                          target.onerror = null;
                        }}
                      />
                    </td>
                    <td>{product.TenSanPham}</td>
                    <td>{product.TenDanMuc || 'N/A'}</td>
                    <td>{formatPrice(product.Gia)}</td>
                    <td>
                      <span className={`status ${product.PhanLoai === 'Nam' ? 'male' : product.PhanLoai === 'Nữ' ? 'female' : 'unisex'}`}>
                        {product.PhanLoai}
                      </span>
                    </td>
                    <td style={{ width: 250, textAlign: "center" }}>
                      <button
                        className="view"
                        title="Xem"
                        onClick={() => handleViewDetail(product)}
                        style={{ marginRight: "10px" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                        </svg>
                      </button>
                      <button
                        className="edit"
                        title="Sửa"
                        onClick={() => handleEdit(product)}
                        style={{ marginRight: "10px" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                        </svg>
                      </button>
                      <button
                        className="delete"
                        title="Xóa"
                        onClick={() => product.MaSanPham && handleDelete(product.MaSanPham)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 0 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
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
              <h2 className="title">{formData.MaSanPham ? "CẬP NHẬT SẢN PHẨM" : "THÊM SẢN PHẨM"}</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Quản lý sản phẩm</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">{formData.MaSanPham ? "Cập nhật" : "Thêm"} sản phẩm</span>
              </div>
            </div>
            <div className="btn-sectionsp">
              <button
                className="back-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
                  <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
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
                    <label htmlFor="productName" className="labelName">Tên sản phẩm :</label>
                    <input type="text" id="productName" name="TenSanPham" className="form-control" value={formData.TenSanPham} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="productShortDesc" className="labelName">Mô tả ngắn :</label>
                    <textarea id="productShortDesc" name="MoTaNgan" className="form-control" rows={4} value={formData.MoTaNgan} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="productCategory" className="labelName"> Danh mục :</label>
                    <select id="productCategory" name="MaDanMuc" className="form-control" value={formData.MaDanMuc} onChange={handleInputChange} required >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.MaDanMuc} value={category.MaDanMuc}>
                          {category.TenDanMuc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="productPrice" className="labelName">  Giá bán : </label>
                    <input type="number" id="productPrice" name="Gia" className="form-control" value={formData.Gia} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="productStock" className="labelName"> Số lượng tồn kho : </label>
                    <input type="number" id="productStock" name="SoLuong" className="form-control" value={formData.SoLuong} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="productSize" className="labelName"> Size :</label>
                    <input type="text" id="productSize" name="Size" className="form-control" value={formData.Size} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="productMaterial" className="labelName"> Chất liệu :</label>
                    <input type="text" id="productMaterial" name="ChatLieu" className="form-control" value={formData.ChatLieu} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="col">
                  <div className="form-group">
                    <label className="labelName">Hình ảnh sản phẩm *</label>
                    {imagePreview ? (
                      <div className="image-preview-products">
                        <img src={imagePreview} alt="Preview" className="preview-image"
                          onLoad={() => {
                            if (imagePreview.startsWith('blob:')) {
                              URL.revokeObjectURL(imagePreview);
                            }
                          }}
                        />
                        <button type="button" className="btn btn-danger button-btn " onClick={removeImage} >
                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                          </svg>
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <div className="image-upload">
                        <label htmlFor="productImage" className="image-upload-label">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.5 14.5V11h1v3.5a.5.5 0 0 1-1 0" />
                          </svg>
                          <p>Nhấn để tải lên hình ảnh</p>
                          <input type="file" id="productImage" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="productType" className="labelName">Phân loại :</label>
                    <select
                      id="productType"
                      name="PhanLoai"
                      className="form-control"
                      value={formData.PhanLoai}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="productDetailDesc" className="labelName">
                  Nội dung chi tiết
                </label>
                <textarea id="productDetailDesc" name="NoiDungChiTiet" className="form-control" rows={6} value={formData.NoiDungChiTiet} onChange={handleInputChange} />
              </div>

              <div className="form-footer">
                <button type="button" className="btnsp btnsp-danger" onClick={() => {
                  setShowForm(false); resetForm();
                }} >
                  Hủy bỏ
                </button>
                <button type="submit" className="btnsp btnsp-primary">
                  {formData.MaSanPham ? 'Cập nhật' : 'Lưu'} sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetailModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>CHI TIẾT SẢN PHẨM</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
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
            <div className="modal-body">
              <div className="product-detail-row">
                <div className="product-detail-col">
                  <img
                    src={selectedProduct.Hinh ? `http://localhost:3000${selectedProduct.Hinh}` : '/default-product.jpg'}
                    alt={selectedProduct.TenSanPham}
                    className="product-detail-img"
                    onError={(e) => {
                     const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                          target.onerror = null;
                    }}
                  />
                </div>
                <div className="product-detail-col">
                  <div className="product-detail-group">
                    <label>Số lượng:</label>
                    <p>{selectedProduct.SoLuong}</p>
                  </div>
                  <div className="product-detail-group">
                    <label>Size:</label>
                    <p>{selectedProduct.Size || 'N/A'}</p>
                  </div>
                  <div className="product-detail-group">
                    <label>Chất liệu:</label>
                    <p>{selectedProduct.ChatLieu || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="product-detail-group">
                <label>Mô tả ngắn:</label>
                <p>{selectedProduct.MoTaNgan || 'Không có mô tả'}</p>
              </div>
              <div className="product-detail-groupmt">
                <label>Nội dung chi tiết:</label>
                <p dangerouslySetInnerHTML={{ __html: selectedProduct.NoiDungChiTiet || 'Không có nội dung chi tiết' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setShowDetailModal(false)}
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;