import axios from 'axios';

const API_URL = 'http://localhost:3000/api/listnew';
import type {News} from '../../types/models';

type NewsResponse = {
  success: boolean;
  data: News | News[];
  message?: string;
};


export const getNews = async (): Promise<News[]> => {
  const response = await axios.get(API_URL);
  return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
};

export const getNewsById = async (id: number): Promise<News> => {
  try {
    const response = await axios.get<NewsResponse>(`${API_URL}/${id}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
    }

    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải thông tin tin tức');
  }
};

export const getNewsByCategory = async (categoryId: number): Promise<News[]> => {
  try {
    const response = await axios.get<NewsResponse>(`${API_URL}/category/${categoryId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
    }

    return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách tin tức');
  }
};

export const createNews = async (newsData: FormData): Promise<News> => {
  const response = await axios.post(API_URL, newsData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const updateNews = async (id: number, newsData: FormData): Promise<News> => {
  const response = await axios.put(`${API_URL}/${id}`, newsData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const deleteNews = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const getNewsCategories = async (): Promise<any[]> => {
  const response = await axios.get('http://localhost:3000/api/categorienew');
  return response.data.data;
};