import axios from 'axios';

const API_URL = 'http://localhost:3000/api/categorienew';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Category {
  MaDanMucTT: number;
  TenDanMucTT: string;
}
export const getNewsCategories = async (): Promise<any[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<ApiResponse<Category[]>>(API_URL);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách');
  }
};

export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await axios.get<ApiResponse<Category>>(`${API_URL}/${id}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin');
  }
};

export const createCategory = async (TenDanMucTT: string): Promise<Category> => {
  try {
    const response = await axios.post<ApiResponse<Category>>(API_URL, { TenDanMucTT });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tạo mới');
  }
};

export const updateCategory = async (MaDanMucTT: number, TenDanMucTT: string): Promise<Category> => {
  try {
    const response = await axios.put<ApiResponse<Category>>(`${API_URL}/${MaDanMucTT}`, { TenDanMucTT });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể cập nhật');
  }
};

export const deleteCategory = async (MaDanMucTT: number): Promise<void> => {
  try {
    const response = await axios.delete<ApiResponse<void>>(`${API_URL}/${MaDanMucTT}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Xóa không thành công');
    }
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể xóa');
  }
};