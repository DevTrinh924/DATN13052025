import { useEffect, useState } from 'react';
import { getOrders, getOrderById, updateOrderStatus, deleteOrder } from '../../services/api/OrdersApi';
import * as XLSX from 'xlsx';
import "../../assets/styles/Order.css";
import "../../assets/styles/Dashboard.css";
import Swal from 'sweetalert2';

export interface Order {
  MaDonHang: number;
  NgayDat: string;
  TrangThai: string;
  TongTien: number;
  MaKhachHang: number;
  DiaChiGiaoHang: string;
  PhuongThucThanhToan: string;
  TrangThaiThanhToan: string;
  MaKhuyenMai: number | null;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  TenKhachHang: string;
  SoDienThoai: string;
  Email?: string;
}

export interface OrderDetail {
  MaChiTiet: number;
  SoLuong: number;
  GiaTien: number;
  Size: string;
  Hinh: string;
  MaDonHang: number;
  MaSanPham: number;
  TenSanPham: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    fromDate: '',
    toDate: '',
    paymentStatus: 'all',
    customerName: ''
  });
  const [newStatus, setNewStatus] = useState('cho_xac_nhan');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        paymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        customerName: filters.customerName
      };
      const data = await getOrders(params);
      setOrders(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi tải danh sách đơn hàng',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleViewOrder = async (id: number) => {
    try {
      console.log('Fetching order details for ID:', id);
      const response = await getOrderById(id);
      console.log('Order details response:', response);

      if (!response) {
        throw new Error('Không nhận được dữ liệu từ server');
      }

      if (!response.chiTiet || !Array.isArray(response.chiTiet)) {
        console.error('Dữ liệu chi tiết không hợp lệ:', response.chiTiet);
        throw new Error('Dữ liệu chi tiết đơn hàng không hợp lệ');
      }

      setSelectedOrder(response);
      setOrderDetails(response.chiTiet);
      setShowDetail(true);
      setShowForm(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: `Có lỗi khi lấy chi tiết đơn hàng: ${error}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateStatus = async (id: number) => {
    try {
      if (!newStatus) {
        Swal.fire({
          title: 'Cảnh báo!',
          text: 'Vui lòng chọn trạng thái mới',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      await updateOrderStatus(id, newStatus);
      Swal.fire({
        title: 'Thành công!',
        text: 'Cập nhật trạng thái thành công',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      fetchOrders();
      setShowForm(false);
      setShowDetail(false);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      cho_xac_nhan: 'Chờ xác nhận',
      da_xac_nhan: 'Đã xác nhận',
      dang_giao: 'Đang giao hàng',
      da_giao: 'Đã giao hàng',
      da_huy: 'Đã hủy'
    };
    return statusLabels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    return status === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán';
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      COD: 'Thanh toán khi nhận hàng',
      ChuyenKhoan: 'Chuyển khoản ngân hàng',
      ViDienTu: 'Ví điện tử'
    };
    return methods[method] || method;
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

    if (!result.isConfirmed) return;
    
    setDeletingId(id);
    try {
      await deleteOrder(id);
      Swal.fire({
        title: 'Đã xóa!',
        text: 'Đơn hàng đã được xóa thành công.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      await fetchOrders();
    } catch (error: any) {
      Swal.fire({
        title: 'Lỗi!',
        text: error.response?.data?.message || 'Lỗi khi xóa đơn hàng',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = currentOrders.map((order, index) => ({
      STT: indexOfFirstItem + index + 1,
      'Mã đơn hàng': `DH${order.MaDonHang.toString().padStart(5, '0')}`,
      'Khách hàng': order.TenKhachHang,
      'Ngày đặt': new Date(order.NgayDat).toLocaleDateString(),
      'Địa chỉ': order.DiaChiGiaoHang,
      'Trạng thái': getStatusLabel(order.TrangThai),
      'Tổng tiền': formatCurrency(order.TongTien),
      'Trạng thái thanh toán': getPaymentStatusLabel(order.TrangThaiThanhToan),
      'Phương thức thanh toán': getPaymentMethodLabel(order.PhuongThucThanhToan)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachDonHang');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
    
    Swal.fire({
      title: 'Thành công!',
      text: 'Xuất file Excel thành công',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

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
      {/* Danh sách đơn hàng */}
      {!showForm && !showDetail && (
        <div id="orderListSection">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">DANH SÁCH ĐƠN HÀNG</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Trang chủ </span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Danh sách đơn hàng</span>
              </div>
            </div>
            <div className="btn-sectiono">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={filters.customerName}
                  onChange={(e) => handleFilterChange(e)}
                  name="customerName"
                />
                <button type="submit" className="button-search" title='d'>
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                </button>
              </div>
              <select
                title='d'
                id="statusFilter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="cho_xac_nhan">Chờ xác nhận</option>
                <option value="da_xac_nhan">Đã xác nhận</option>
                <option value="dang_giao">Đang giao</option>
                <option value="da_giao">Đã giao</option>
                <option value="da_huy">Đã hủy</option>
              </select>
              <select
                title='f'
                id="paymentStatus"
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="chua_thanh_toan">Chưa thanh toán</option>
                <option value="da_thanh_toan">Đã thanh toán</option>
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
          <div className="product-table">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>STT</th>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order.MaDonHang}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>DH{order.MaDonHang.toString().padStart(5, '0')}</td>
                    <td>{order.TenKhachHang}</td>
                    <td>{new Date(order.NgayDat).toLocaleDateString()}</td>
                    <td>{order.DiaChiGiaoHang}</td>
                    <td>
                      <span className={`status ${order.TrangThai}`}>
                        {getStatusLabel(order.TrangThai)}
                      </span>
                    </td>
                    <td>{formatCurrency(order.TongTien)}</td>
                    <td>
                      <span className={`payment-status ${order.TrangThaiThanhToan}`}>
                        {getPaymentStatusLabel(order.TrangThaiThanhToan)}
                      </span>
                    </td>
                    <td style={{ width: 250, textAlign: "center" }}>
                      <button className="view" title="Xem chi tiết" onClick={() => handleViewOrder(order.MaDonHang)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                        </svg>
                      </button>
                      <button className="edit" title="Cập nhật" onClick={() => { setSelectedOrder(order); setNewStatus(order.TrangThai); setShowForm(true); setShowDetail(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                        </svg>
                      </button>
                      <button className="delete" title="Xóa" onClick={() => handleDelete(order.MaDonHang)} disabled={deletingId === order.MaDonHang}>
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
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
              <a
                href="#"
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
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
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
      {showForm && selectedOrder && (
        <div className="add-form">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">CẬP NHẬT ĐƠN HÀNG</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Danh sách khách hàng </span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">Cập nhật đơn hàng</span>
              </div>
            </div>
            <div className="btn-sectiono">
              <button
                className="back-btn"
                onClick={() => {
                  setShowForm(false);
                  setSelectedOrder(null);
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
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStatus(selectedOrder.MaDonHang);
            }}>
              <div className="form-group">
                <label className="labelName">Mã đơn hàng</label>
                <input
                  type="text"
                  value={`DH${selectedOrder.MaDonHang.toString().padStart(5, '0')}`}
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="labelName">Trạng thái hiện tại</label>
                <input
                  type="text"
                  value={getStatusLabel(selectedOrder.TrangThai)}
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="labelName">Cập nhật trạng thái</label>
                <select
                  title='Chọn trạng thái mới'
                  id="newStatus"
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="cho_xac_nhan">Chờ xác nhận</option>
                  <option value="da_xac_nhan">Đã xác nhận</option>
                  <option value="dang_giao">Đang giao</option>
                  <option value="da_giao">Đã giao</option>
                  <option value="da_huy">Đã hủy</option>
                </select>
              </div>
              <div className="form-group">
                <label className="labelName">Ghi chú (nếu có)</label>
                <textarea id="statusNote" className="form-control" rows={3}  title='F'/>
              </div>
              <div className="form-footer">
                <button
                  type="button"
                  className="btnsp btnsp-danger"
                  onClick={() => setShowForm(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btnsp btnsp-primary">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetail && selectedOrder && (
        <div className="add-form">
          <div className="product-actions">
            <div className="filter-section">
              <h2 className="title">CHI TIẾT ĐƠN HÀNG</h2>
              <div className="breadcrumbsp">
                <span className="breadcrumbsp-bold">Danh sách khách hàng </span>
                <span className="breadcrumbsp-separator">›</span>
                <span className="breadcrumbsp-current">CHI TIẾT ĐƠN HÀNG</span>
              </div>
            </div>
            <div className="btn-sectiono">
              <button
                className="back-btn"
                onClick={() => {
                  setShowDetail(false);
                  setSelectedOrder(null);
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
            <div className="order-info">
              <div className="row">
                <div className="col">
                  <label className="labelName">Khách hàng:</label>
                  <span>{selectedOrder.TenKhachHang}</span>
                </div>
                <div className="col">
                  <label className="labelName">Số điện thoại:</label>
                  <span>{selectedOrder.SoDienThoaiNhan || selectedOrder.SoDienThoai}</span>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label className="labelName">Ngày đặt:</label>
                  <span>{new Date(selectedOrder.NgayDat).toLocaleDateString()}</span>
                </div>
                <div className="col">
                  <label className="labelName">Trạng thái:</label>
                  <span className={`status ${selectedOrder.TrangThai}`}>
                    {getStatusLabel(selectedOrder.TrangThai)}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label className="labelName">Địa chỉ giao hàng:</label>
                  <span>{selectedOrder.DiaChiGiaoHang}</span>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label className="labelName">Phương thức thanh toán:</label>
                  <span>{getPaymentMethodLabel(selectedOrder.PhuongThucThanhToan)}</span>
                </div>
                <div className="col">
                  <label>Trạng thái thanh toán:</label>
                  <span className={`payment-status ${selectedOrder.TrangThaiThanhToan}`}>
                    {getPaymentStatusLabel(selectedOrder.TrangThaiThanhToan)}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label className="labelName">Khuyến mãi:</label>
                  <span>{selectedOrder.MaKhuyenMai ? `KM${selectedOrder.MaKhuyenMai}` : 'Không có'}</span>
                </div>
                <div className="col">
                  <label className="labelName">Tổng tiền:</label>
                  <span className="amount">{formatCurrency(selectedOrder.TongTien)}</span>
                </div>
              </div>
            </div>
            <div className="product-table">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>STT</th>
                    <th style={{ width: 200 }}>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.map((detail, index) => (
                    <tr key={detail.MaChiTiet}>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={`http://localhost:3000/uploads/${detail.Hinh}`}
                            alt={detail.TenSanPham}
                            style={{ width: 50, height: 50, marginRight: 10 }}
                          />
                          {detail.TenSanPham} (Size: {detail.Size})
                        </div>
                      </td>
                      <td>{formatCurrency(detail.GiaTien)}</td>
                      <td>{detail.SoLuong}</td>
                      <td>{formatCurrency(detail.GiaTien * detail.SoLuong)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng:</td>
                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(selectedOrder.TongTien)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="form-footer">
              <button
                type="button"
                className="btnsp btnsp-danger"
                onClick={() => setShowDetail(false)}
              >
                Thoát
              </button>
              <button type="button" className="btnsp btnsp-primary">In đơn hàng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;