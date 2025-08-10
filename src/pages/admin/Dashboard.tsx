import { useEffect, useState, useRef } from 'react';
import { getOrderStats, getOrders, getOrderById } from '../../services/api/OrdersApi';
import { getProducts } from '../../services/api/ProductsApi';
import { getClients } from '../../services/api/ClientApi';
import { formatPrice } from '../../utils/formatPrice';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import '../../assets/styles/Dashboard.css';

// Register ChartJS components, including BarElement
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Added to support Bar chart
  Title,
  Tooltip,
  Legend
);

interface Order {
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

interface OrderDetail {
  MaChiTiet: number;
  SoLuong: number;
  GiaTien: number;
  Size: string;
  Hinh: string;
  MaDonHang: number;
  MaSanPham: number;
  TenSanPham: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [revenueData, setRevenueData] = useState<{ [key: string]: number }>({});
  const [topProductsData, setTopProductsData] = useState<{ name: string; count: number }[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState('1');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // References to store chart instances
  const revenueChartRef = useRef<ChartJS | null>(null);
  const topProductsChartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, revenueRes, productsRes, products, clients, ordersRes] = await Promise.all([
          getOrderStats(),
          getOrderStats({ year: selectedYear }),
          getOrderStats({ quarter: selectedQuarter }),
          getProducts(),
          getClients(),
          getOrders()
        ]);

        const latestOrders = ordersRes
          .sort((a: Order, b: Order) => new Date(b.NgayDat).getTime() - new Date(a.NgayDat).getTime())
          .slice(0,5);

        setStats({
          totalRevenue: statsRes.totalRevenue || 0,
          totalOrders: statsRes.totalOrders || 0,
          totalProducts: products.length || 0,
          totalCustomers: clients.length || 0,
        });

        setRevenueData(revenueRes.monthlyRevenue || {});
        setTopProductsData(productsRes.topProducts || []);
        setRecentOrders(latestOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedQuarter]);

  // Cleanup chart instances on component unmount or before re-rendering charts
  useEffect(() => {
    return () => {
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
        revenueChartRef.current = null;
      }
      if (topProductsChartRef.current) {
        topProductsChartRef.current.destroy();
        topProductsChartRef.current = null;
      }
    };
  }, []);

  const handleViewOrder = async (id: number) => {
    try {
      const response = await getOrderById(id);
      if (response && response.chiTiet) {
        setSelectedOrder(response);
        setOrderDetails(response.chiTiet);
        setShowDetail(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      cho_xac_nhan: 'Chờ xác nhận',
      da_xac_nhan: 'Đã xác nhận',
      dang_giao: 'Đang giao hàng',
      da_giao: 'Đã giao hàng',
      da_huy: 'Đã hủy',
    };
    return statusLabels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      COD: 'Thanh toán khi nhận hàng',
      ChuyenKhoan: 'Chuyển khoản ngân hàng',
      ViDienTu: 'Ví điện tử',
    };
    return methods[method] || method;
  };

  const getPaymentStatusLabel = (status: string) => {
    return status === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa thanh toán';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const renderRevenueChart = () => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
    ];

    const dataValues = months.map((_, index) => {
      const monthKey = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
      return revenueData[monthKey] || 0;
    });

    const data = {
      labels: months,
      datasets: [
        {
          label: 'Doanh thu (VND)',
          data: dataValues,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#6b7280',
            font: {
              family: "'Inter', sans-serif",
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              return ` ${formatPrice(context.raw)}`;
            }
          },
          backgroundColor: '#1f2937',
          titleColor: '#f9fafb',
          bodyColor: '#f9fafb',
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb',
          },
          ticks: {
            color: '#6b7280',
            callback: function (value: any) {
              return formatPrice(value);
            }
          },
        },
      },
    };

    return (
        <div className="chart-content">
          {isLoading ? (
            <div className="chart-loading">Đang tải dữ liệu...</div>
          ) : (
            <Line
              ref={(ref) => {
                if (ref) { if (revenueChartRef.current) { revenueChartRef.current.destroy();
                  }
                  revenueChartRef.current = ref;
                }
              }}
              data={data}  options={options}
            />
          )}
        </div>
    );
  };

  const renderTopProductsChart = () => {
    if (topProductsData.length === 0) {
      return <div className="no-data">Không có dữ liệu sản phẩm bán chạy</div>;
    }

    return (
        <div className="bar-chart-container">
          {isLoading ? (
            <div className="chart-loading">Đang tải dữ liệu...</div>
          ) : (
            <Bar
              ref={(ref) => {
                if (ref) {
                  if (topProductsChartRef.current) {
                    topProductsChartRef.current.destroy();
                  }
                  topProductsChartRef.current = ref;
                }
              }}
              data={{
                labels: topProductsData.map(item => item.name),
                datasets: [
                  {
                    label: 'Số lượng bán',
                    data: topProductsData.map(item => item.count),
                    backgroundColor: '#d4af37',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    barThickness: 50, // giảm độ rộng cột
                    maxBarThickness: 50 // giới hạn tối đa
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        return ` ${context.raw} sản phẩm`;
                      }
                    },
                    backgroundColor: '#1f2937',
                    titleColor: '#f9fafb',
                    bodyColor: '#f9fafb',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#6b7280',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: '#e5e7eb',
                    },
                    ticks: {
                      color: '#6b7280',
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          )}
     
      </div>
    );
  };

  return (
    <>

      {/* Dashboard Cards */}
      <div className="card-container">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tổng doanh thu</div>
              <div className="card-value">{formatPrice(stats.totalRevenue)}</div>
              <div className="card-footer">Tính đến hiện tại</div>
            </div>
            <div className="card-icon bg-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Đơn hàng</div>
              <div className="card-value">{stats.totalOrders}</div>
              <div className="card-footer">Tổng số đơn hàng</div>
            </div>
            <div className="card-icon bg-success">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Khách hàng</div>
              <div className="card-value">{stats.totalCustomers}</div>
              <div className="card-footer">Tổng số khách hàng</div>
            </div>
            <div className="card-icon bg-dark">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Sản phẩm</div>
              <div className="card-value">{stats.totalProducts}</div>
              <div className="card-footer">Tổng số sản phẩm</div>
            </div>
            <div className="card-icon bg-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.1 5.3a.5.5 0 0 1 0-.6zm11.386 3.785-1.806-2.41-.776 2.413zm-3.633.004.961-2.989H4.186l.963 2.995zM5.47 5.495 8 13.366l2.532-7.876zm-1.371-.999-.78-2.422-1.818 2.425zM1.499 5.5l5.113 6.817-2.192-6.82zm7.889 6.817 5.123-6.83-2.928.002z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Doanh thu theo tháng ({selectedYear})</h3>
            <select
              title='Chọn năm'
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="box-full"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
           <div className="chart-content">{renderRevenueChart()}</div>
        </div>
        <div className="chart-container">
          <div className="chart-header">
          <h3 className="chart-title">Sản phẩm bán chạy (Quý {selectedQuarter})</h3>
          <select
            title='Chọn quý'
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="box-full"
          >
            <option value="1">Quý 1</option>
            <option value="2">Quý 2</option>
            <option value="3">Quý 3</option>
            <option value="4">Quý 4</option>
          </select>
        </div>
         <div className="bar-chart-container">
             {renderTopProductsChart()}
          </div>
        </div>
         
         
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <div className="section-header">
          <h3 className="section-title">Đơn hàng gần đây</h3>
          <a href="/admin/orders" className="view-all-btn">Xem tất cả</a>
        </div>
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.MaDonHang}>
                    <td>DH{order.MaDonHang.toString().padStart(5, '0')}</td>
                    <td>{order.TenKhachHang}</td>
                    <td>{formatDate(order.NgayDat)}</td>
                    <td>{formatPrice(order.TongTien)}</td>
                    <td>
                      <span className={`status ${order.TrangThai}`}>
                        {getStatusLabel(order.TrangThai)}
                      </span>
                    </td>
                    <td>
                      <button
                        title='Xem chi tiết'
                        className="view-btn"
                        onClick={() => handleViewOrder(order.MaDonHang)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="no-orders">
                    {isLoading ? 'Đang tải...' : 'Không có đơn hàng nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="modal-overlay">
          <div className="order-detail-modal">
            <div className="modal-header">
              <h2>Chi tiết đơn hàng DH{selectedOrder.MaDonHang.toString().padStart(5, '0')}</h2>
              <button className="close-btn" onClick={() => setShowDetail(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="order-info-section">
                <div className="info-row">
                  <div className="info-item">
                    <label>Khách hàng:</label>
                    <span>{selectedOrder.TenKhachHang}</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedOrder.SoDienThoaiNhan || selectedOrder.SoDienThoai}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <label>Ngày đặt:</label>
                    <span>{formatDate(selectedOrder.NgayDat)}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái:</label>
                    <span className={`status ${selectedOrder.TrangThai}`}>
                      {getStatusLabel(selectedOrder.TrangThai)}
                    </span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <label>Địa chỉ giao hàng:</label>
                    <span>{selectedOrder.DiaChiGiaoHang}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <label>Phương thức thanh toán:</label>
                    <span>{getPaymentMethodLabel(selectedOrder.PhuongThucThanhToan)}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái thanh toán:</label>
                    <span className={`payment-status ${selectedOrder.TrangThaiThanhToan}`}>
                      {getPaymentStatusLabel(selectedOrder.TrangThaiThanhToan)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-items-section">
                <h3>Danh sách sản phẩm</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Sản phẩm</th>
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
                          <div className="product-infod">
                            <img
                              src={`http://localhost:3000/uploads/${detail.Hinh}`}
                              alt={detail.TenSanPham}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-product.jpg';
                              }}
                            />
                            <div>
                              <div className="product-name">{detail.TenSanPham}</div>
                              <div className="product-size">Size: {detail.Size || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(detail.GiaTien)}</td>
                        <td>{detail.SoLuong}</td>
                        <td>{formatPrice(detail.GiaTien * detail.SoLuong)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="total-label">Tổng cộng:</td>
                      <td className="total-amount">{formatPrice(selectedOrder.TongTien)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
              <button className="btn primary">
                In đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;