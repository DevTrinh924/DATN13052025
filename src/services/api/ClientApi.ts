import axios from 'axios';

const API_URL = 'http://localhost:3000/api/client';
const token = localStorage.getItem('token');
import type {Client} from '../../types/models';


interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Client;
  message?: string;
}

export const getClients = async (): Promise<Client[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const getClientById = async (id: number): Promise<Client | null> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
};

export const createClient = async (clientData: FormData): Promise<Client | null> => {
  try {
    const response = await axios.post(API_URL, clientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    return null;
  }
};

export const updateClient = async (id: number, clientData: FormData): Promise<Client | null> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, clientData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
};

export const deleteClient = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
};
export const loginUser = async (credentials: { Email: string, MatKhau: string }): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng nhập thất bại'
    };
  }
};

export const registerUser = async (userData: {
  HoTen: string;
  Email: string;
  MatKhau: string;
  DiaChi?: string;
  SoDienThoai?: string;
}): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại'
    };
  }
};

export const getCurrentUser = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Lỗi xác thực'
    };
  }
};