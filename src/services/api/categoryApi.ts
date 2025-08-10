import axios from 'axios';

const API_URL = 'http://localhost:3000/api/categories';
import type {Category} from '../../types/models';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data || response.data; // Xử lý cả 2 trường hợp
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};
export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    throw new Error(`Failed to fetch category with id ${id}`);
  }

};

export const createCategory = async (formData: FormData): Promise<Category> => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to create category');
    } else {
      throw new Error('Network error occurred');
    }
  }
};

export const updateCategory = async (id: number, formData: FormData): Promise<Category> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update category');
    } else {
      throw new Error('Network error occurred');
    }
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw new Error(`Failed to delete category with id ${id}`);
  }
};