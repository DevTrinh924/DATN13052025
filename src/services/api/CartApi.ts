// services/api/CartApi.ts
import axios from 'axios';

const CART_API_URL = 'http://localhost:3000/api/cart';
import type {CartItem} from '../../types/models';


export const getCart = async (): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    const response = await axios.get(CART_API_URL, { 
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Xử lý đường dẫn hình ảnh
    const cartItems = response.data.data || response.data || [];
    return cartItems.map((item: any) => ({
      ...item,
      Hinh: item.Hinh 
        ? item.Hinh.startsWith('/uploads/') 
          ? item.Hinh 
          : `/uploads/${item.Hinh}`
        : ''
    }));
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
};

export const addToCart = async (item: Omit<CartItem, 'MaGioHang'>): Promise<{success: boolean, data: CartItem[], message: string}> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    // Đảm bảo item có đủ các trường bắt buộc
    const cartItem = {
      productId: item.MaSanPham,
      quantity: item.SoLuong || 1,
      size: item.Size || '',
      Hinh: item.Hinh || ''
    };

    const response = await axios.post(CART_API_URL, cartItem, { 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to add to cart');
  }
};
export const updateCartItem = async (cartId: number, quantity: number): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await axios.put(`${CART_API_URL}/${cartId}`, { quantity }, { 
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
};

export const removeFromCart = async (cartId: number): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await axios.delete(`${CART_API_URL}/${cartId}`, { 
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove from cart');
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    await axios.delete(CART_API_URL, { 
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};
export const getCartCount = async (): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 0;

    const response = await axios.get(`${CART_API_URL}/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Kiểm tra response và trả về 0 nếu không có dữ liệu
    return response.data?.count || 0;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0; // Trả về 0 khi có lỗi
  }
};