// // Định nghĩa interface
export  interface Category {
  MaDanMuc: number;
  TenDanMuc: string;
  hinh_dm: string;
}
 export interface Product {
  MaSanPham: number;
  TenSanPham: string;
  Gia: number;
  Hinh: string;
  MoTaNgan: string;
  Size: string;
  PhanLoai: string;
  ChatLieu: string;
  NoiDungChiTiet: string;
  MaDanMuc: number;
  TenDanMuc?: string;
  SoLuong?: number;
}
export interface Favorite {
  MaKhachHang: number;
  MaSanPham: number;
  HoTen: string;
  TenSanPham: string;
  Gia: number;
  Hinh: string;
  SanPhamHinh?: string;
  TenDanMuc: string;
  NgayThem: string;
  avatar?: string;
  KhachHangAvatar?: string;
  Size?: string;
  ChatLieu?: string;
  NoiDungChiTiet?: string;
}
export interface PromotionResult {
  success: boolean;
  message: string;
  discountAmount: number;
  promotionName?: string;
}
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
    price: number;
  Size: string;
  Hinh: string;
  MaDonHang: number;
  MaSanPham: number;
  TenSanPham: string;
}
export interface News {
  MaTinTuc?: number;
  TieuDe: string;
  MoTaNgan: string;
  Hinh: string;
  NoiDungChiTiet: string;
  MaDanMucTT: number;
  TenDanMucTT?: string;
  TrangThai?: boolean;
  NgayDang?: string;
   LuotXem?: number
}

export interface Comment {
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
 export interface Client {
  MaKhachHang?: number;
  HoTen: string;
  Email: string;
  MatKhau?: string;
  DiaChi?: string;
  SoDienThoai?: string;
  VaiTro?: 'user' | 'admin';
  avatar?: string;
}
export interface CartItem {
  MaGioHang: number;
  MaSanPham: number;
  TenSanPham: string;
  Gia: number;
  SoLuong: number;
  Size: string;
  Hinh: string;
}