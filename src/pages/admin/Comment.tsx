import { useEffect, useState } from 'react';
import { getComments, approveComment, rejectComment, deleteComment } from '../../services/api/CommentApi';
import "../../assets/styles/Commet.css";
import Swal from 'sweetalert2';

interface Comment {
  MaDanhGia: number;
  SoSao: number;
  BinhLuan: string;
  NgayDanhGia: string;
  TrangThai: string;
  MaKhachHang: number;
  MaSanPham: number;
  TenSanPham: string;
  HoTen: string;
  avatar: string;
}

const CommentManagement = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    const filtered = comments.filter(comment => {
      const matchesSearch = comment.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           comment.TenSanPham.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProduct = selectedProduct === 'all' || comment.MaSanPham.toString() === selectedProduct;
      const matchesRating = selectedRating === 'all' || comment.SoSao.toString() === selectedRating;
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'pending' && comment.TrangThai === 'cho_duyet') ||
                           (selectedStatus === 'approved' && comment.TrangThai === 'da_duyet') ||
                           (selectedStatus === 'rejected' && comment.TrangThai === 'tu_choi');
      
      return matchesSearch && matchesProduct && matchesRating && matchesStatus;
    });
    setFilteredComments(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedProduct, selectedRating, selectedStatus, comments]);

  const fetchComments = async () => {
    try {
      const data = await getComments();
      setComments(data);
      setFilteredComments(data);
    } catch (error) {
      console.error('Lỗi tải đánh giá:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải danh sách đánh giá. Vui lòng thử lại!',
      });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveComment(id);
      await Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã duyệt đánh giá thành công!',
      });
      fetchComments();
    } catch (error) {
      console.error('Lỗi duyệt đánh giá:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể duyệt đánh giá. Vui lòng thử lại!',
      });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectComment(id);
      await Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã từ chối đánh giá thành công!',
      });
      fetchComments();
    } catch (error) {
      console.error('Lỗi từ chối đánh giá:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể từ chối đánh giá. Vui lòng thử lại!',
      });
    }
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
        await deleteComment(id);
        await Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Đánh giá đã được xóa thành công.',
        });
        fetchComments();
      } catch (error) {
        console.error('Lỗi xóa đánh giá:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể xóa đánh giá. Vui lòng thử lại!',
        });
      }
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star-filled" : "star-empty"}>
          ★
        </span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'cho_duyet':
        return <span className="status-pending">Chờ duyệt</span>;
      case 'da_duyet':
        return <span className="status-approved">Đã duyệt</span>;
      case 'tu_choi':
        return <span className="status-rejected">Từ chối</span>;
      default:
        return status;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

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
    <div className="promotion-management">
      <div className="product-actions">
        <div className="filter-section">
          <h2 className="title">QUẢN LÝ ĐÁNH GIÁ SẢN PHẨM</h2>
          <div className="breadcrumbsp">
            <span className="breadcrumbsp-bold">Bán hàng</span>
            <span className="breadcrumbsp-separator">›</span>
            <span className="breadcrumbsp-current">Đánh giá</span>
          </div>
        </div>
        <div className="btn-sectionct">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="button-search">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </button>
          </div>
          <select
            title='danh sách sản phẩm'
            className="filter-control"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
          >
            <option value="all">Tất cả sản phẩm</option>
            {Array.from(new Set(comments.map(c => c.MaSanPham))).map(id => {
              const product = comments.find(c => c.MaSanPham === id);
              return (
                <option key={id} value={id.toString()}>
                  {product?.TenSanPham}
                </option>
              );
            })}
          </select>
          <select
          title='danh sách đánh giá'
            className="filter-control"
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select
          title='danh sách trạng thái'
            className="filter-control"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>
      <div className="product-table">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>STT</th>
              <th style={{ width: 180 }}>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Đánh giá</th>
              <th>Bình luận</th>
              <th>Ngày đánh giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentComments.map((comment, index) => (
              <tr key={comment.MaDanhGia}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <div className="customer-info">
                    <img 
                      src={comment.avatar ? `http://localhost:3000/uploads/${comment.avatar}` : 'https://via.placeholder.com/40'} 
                      alt="Customer" 
                      className="customer-avatar" 
                    />
                    <span>{comment.HoTen}</span>
                  </div>
                </td>
                <td>{comment.TenSanPham}</td>
                <td>{renderStars(comment.SoSao)}</td>
                <td className="review-comment" title={comment.BinhLuan}>
                  {comment.BinhLuan}
                </td>
                <td>{new Date(comment.NgayDanhGia).toLocaleDateString()}</td>
                <td>{renderStatus(comment.TrangThai)}</td>
                <td>
                  {comment.TrangThai !== 'tu_choi' && (
                    <button 
                      className="reject" 
                      title="Từ chối"
                      onClick={() => handleReject(comment.MaDanhGia)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                      </svg>
                    </button>
                  )}
                  {comment.TrangThai !== 'da_duyet' && (
                    <button 
                      className="approve" 
                      title="Duyệt"
                      onClick={() => handleApprove(comment.MaDanhGia)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                      </svg>
                    </button>
                  )}
                  <button 
                    className="actioncn-btn delete" 
                    title="Xóa"
                    onClick={() => handleDelete(comment.MaDanhGia)}
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
  );
};

export default CommentManagement;