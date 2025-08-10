import axios from 'axios';

const API_URL = 'http://localhost:3000/api/orders';

// Định nghĩa kiểu dữ liệu
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

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = async (id: number): Promise<Order & { chiTiet: OrderDetail[] }> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Cấu trúc dữ liệu không hợp lệ');
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (id: number, newStatus: string): Promise<{ message: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    const response = await axios.put(
      `${API_URL}/${id}/status`,
      { newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
  }
};

// Lấy danh sách đơn hàng với bộ lọc
export const getOrders = async (params: {
  status?: string;
  fromDate?: string;
  toDate?: string;
  paymentStatus?: string;
  customerName?: string;
} = {}): Promise<Order[]> => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    throw error;
  }
};

// Lấy thống kê đơn hàng
export const getOrderStats = async (params: {
  year?: string;
  quarter?: string;
} = {}): Promise<{
  totalRevenue: number;
  totalOrders: number;
  monthlyRevenue?: { [key: string]: number };
  topProducts?: { name: string; count: number }[];
}> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    const response = await axios.get(`${API_URL}/stats/summary`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data || !response.data.data) {
      throw new Error('Cấu trúc dữ liệu không hợp lệ');
    }

    return {
      totalRevenue: response.data.data.totalRevenue || 0,
      totalOrders: response.data.data.totalOrders || 0,
      monthlyRevenue: response.data.data.monthlyRevenue || {},
      topProducts: response.data.data.topProducts || [],
    };
  } catch (error) {
    console.error('Lỗi khi lấy thống kê đơn hàng:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      monthlyRevenue: {},
      topProducts: [],
    };
  }
};

// Xóa đơn hàng
export const deleteOrder = async (id: number) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    throw error;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData: {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
    price: number;
    size: string;
    Hinh: string;
  }[];
  paymentMethod: string;
  shippingAddress: string;
  totalAmount: number;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  MaKhuyenMai?: string | null;
}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    for (const item of orderData.items) {
      const productResponse = await axios.get(`http://localhost:3000/api/products/${item.productId}`);
      const product = productResponse.data;

      if (product.SoLuong < item.quantity) {
        throw new Error(`Sản phẩm ${product.TenSanPham} chỉ còn ${product.SoLuong} sản phẩm`);
      }
    }

    const response = await axios.post(API_URL, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    localStorage.removeItem('buyNowItem');
    return { ...response.data, success: true };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Chi tiết lỗi:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
    throw error;
  }
};