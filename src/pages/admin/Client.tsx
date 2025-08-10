import { useEffect, useState } from 'react';
import { getClients, updateClient, deleteClient } from '../../services/api/ClientApi';
import "../../assets/styles/Client.css";
import Swal from 'sweetalert2';

interface Client {
  MaKhachHang?: number;
  HoTen: string;
  Email: string;
  MatKhau?: string;
  DiaChi: string;
  SoDienThoai: string;
  VaiTro: 'user' | 'admin';
  avatar?: string;
}

const Client = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Client>({
    HoTen: '',
    Email: '',
    DiaChi: '',
    SoDienThoai: '',
    VaiTro: 'user',
    MatKhau: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 8; // Số khách hàng mỗi trang

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    let filtered = clients;

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.SoDienThoai.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo vai trò
    if (roleFilter !== 'all') {
      filtered = filtered.filter(c => c.VaiTro === roleFilter);
    }

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  }, [searchTerm, roleFilter, clients]);

  const fetchClients = async () => {
    try {
      const data = await getClients() as Client[];
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Lỗi tải danh sách khách hàng:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Đã xảy ra lỗi khi tải danh sách khách hàng.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    setFormData({ ...formData, avatar: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'avatar') {
          formDataToSend.append(key, String(formData[key as keyof Client]));
        }
      });
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      if (formData.MaKhachHang) {
        await updateClient(formData.MaKhachHang, formDataToSend);
        Swal.fire({
          title: 'Thành công!',
          text: 'Cập nhật khách hàng thành công.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchClients();
          setShowForm(false);
          resetForm();
        });
      }
    } catch (error) {
      console.error('Lỗi cập nhật thông tin khách hàng:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Đã xảy ra lỗi khi cập nhật thông tin khách hàng.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      HoTen: '',
      Email: '',
      DiaChi: '',
      SoDienThoai: '',
      VaiTro: 'user',
      MatKhau: ''
    });
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setAvatarPreview(client.avatar ? `http://localhost:3000${client.avatar}` : null);
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
        await deleteClient(id);
        fetchClients();
        // Nếu trang hiện tại không còn dữ liệu, chuyển về trang trước
        if (filteredClients.length <= itemsPerPage && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        Swal.fire(
          'Đã xóa!',
          'Khách hàng đã được xóa.',
          'success'
        );
      } catch (error) {
        console.error('Lỗi xóa:', error);
        Swal.fire({
          title: 'Lỗi!',
          text: 'Đã xảy ra lỗi khi xóa khách hàng.',
          icon: 'error',
          confirmButtonText: 'OK'
      });
      }
    }
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="client-container">
      {!showForm ? (
        <div id="productListSection">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">DANH SÁCH KHÁCH HÀNG</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Trang chủ</span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh sách khách hàng</span>
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
              </div>
    
                <select
                  title='vai trò'
                  style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="form-control"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
             
            </div>
          </div>
          
          <div className="product-table">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th style={{ width: 200 }}>Ảnh đại diện</th>
                  <th>Tên khách hàng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((client, index) => (
                  <tr key={client.MaKhachHang}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <img
                        src={client.avatar ? `http://localhost:3000${client.avatar}` : '/default-avatar.jpg'}
                        alt={client.HoTen}
                        className="avatar-img"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";
                          target.onerror = null;
                        }}
                        style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </td>
                    <td>{client.HoTen}</td>
                    <td>{client.Email}</td>
                    <td>{client.SoDienThoai}</td>
                    <td>{client.DiaChi}</td>
                    <td>{client.VaiTro === 'admin' ? 'Admin' : 'User'}</td>
                    <td style={{ width: 250, textAlign: "center" }}>
                      <button
                        className="edit"
                        title="Sửa"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEdit(client)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                        </svg>
                      </button>
                      <button
                        className="delete"
                        title="Xóa"
                        onClick={() => handleDelete(client.MaKhachHang!)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
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
                  <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>
                
              </button>
            </div>
            {Array.from({ length: totalPages }, (_, index) => (
              <div className="page-item" key={index + 1}>
                <button
                  className={`page-link ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
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
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="add-form">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">CẬP NHẬT TÀI KHOẢN</h2>
              <div className="breadcrumb">
                <span className="breadcrumb-bold">Quản lý khách hàng</span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">Cập nhật Tài khoản</span>
              </div>
            </div>
            <div className="btn-sectiontk">
              <button
                className="back-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
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
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="clientName" className="labelName">Họ tên:</label>
                    <input
                      type="text"
                      id="clientName"
                      name="HoTen"
                      className="form-control"
                      value={formData.HoTen}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clientEmail" className="labelName">Email:</label>
                    <input
                      type="email"
                      id="clientEmail"
                      name="Email"
                      className="form-control"
                      value={formData.Email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clientPhone" className="labelName">Số điện thoại:</label>
                    <input
                      type="text"
                      id="clientPhone"
                      name="SoDienThoai"
                      className="form-control"
                      value={formData.SoDienThoai}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="clientRole" className="labelName">Vai trò:</label>
                    <select
                      id="clientRole"
                      name="VaiTro"
                      className="form-control"
                      value={formData.VaiTro}
                      onChange={handleInputChange}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="col">
                  <div className="form-group">
                    <label className="labelName">Ảnh đại diện</label>
                    {avatarPreview ? (
                      <div className="avatar-preview">
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="preview-avatar"
                          onLoad={() => {
                            if (avatarPreview.startsWith('blob:')) {
                              URL.revokeObjectURL(avatarPreview);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger button-btn"
                          onClick={removeAvatar}
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
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="clientAddress" className="labelName">Địa chỉ:</label>
                <textarea
                  id="clientAddress"
                  name="DiaChi"
                  className="form-control"
                  rows={4}
                  value={formData.DiaChi}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-footer">
                <button
                  type="button"
                  className="btnsp btnsp-danger"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btnsp btnsp-primary">
                  Cập nhật khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Client;