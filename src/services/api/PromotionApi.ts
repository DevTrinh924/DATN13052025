import axios from 'axios';

const PROMOTION_API_URL = 'http://localhost:3000/api/promotions';
import type {PromotionResult} from '../../types/models';

export const applyPromotion = async (promoCode: string, subtotal: number): Promise<PromotionResult> => {
  try {
    const response = await axios.post(`${PROMOTION_API_URL}/apply`, {
      promoCode,
      subtotal
    }, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)){
      throw new Error(error.response?.data?.message || 'Áp dụng mã giảm giá thất bại');
    }
    throw new Error('Áp dụng mã giảm giá thất bại');
  }
};

export const getPromotions = async (filters = {}): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await axios.get(PROMOTION_API_URL, {
      params: filters,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Lỗi khi tải khuyến mãi:', error);
    throw error;
  }
};

export const createPromotion = async (formData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await axios.post(PROMOTION_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo khuyến mãi:', error);
    throw error;
  }
};


export const updatePromotion = async (id: number, formData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    const response = await axios.put(`${PROMOTION_API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật khuyến mãi:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Lỗi khi cập nhật khuyến mãi';
      throw new Error(errorMessage);
    }
    throw error;
  }
};


export const deletePromotion = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }

    await axios.delete(`${PROMOTION_API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};
