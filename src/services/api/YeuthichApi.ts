import axios from 'axios';

const FAVORITES_API_URL = 'http://localhost:3000/api/yeuthich';
import type {Favorite} from '../../types/models';


export const getFavorites = async (token: string): Promise<Favorite[]> => {
  try {
    const response = await axios.get<{data: Favorite[]}>(FAVORITES_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};


export const getFavoriteDetail = async (id: string, token: string): Promise<Favorite | null> => {
  try {
    const response = await axios.get(`${FAVORITES_API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching favorite detail:", error);
    return null;
  }
};

export const addFavorite = async (MaKhachHang: number, MaSanPham: number, token: string): Promise<void> => {
  try {
    await axios.post(FAVORITES_API_URL, { MaKhachHang, MaSanPham }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const deleteFavorite = async (MaSanPham: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${FAVORITES_API_URL}/product/${MaSanPham}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    throw error;
  }
};

export const addToWishlist = async (MaKhachHang: number, MaSanPham: number, token: string): Promise<void> => {
  try {
    await axios.post(`${FAVORITES_API_URL}/add`, { 
      MaKhachHang, 
      MaSanPham 
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

export const getPopularFavorites = async (): Promise<Favorite[]> => {
  try {
    const response = await axios.get<Favorite[]>(`${FAVORITES_API_URL}/popular`);
    return response.data;
  } catch (error) {
    console.error("Error fetching popular favorites:", error);
    return [];
  }
};

