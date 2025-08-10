import axios from 'axios';

const PRODUCTS_API_URL = 'http://localhost:3000/api/products';
const CATEGORIES_API_URL = 'http://localhost:3000/api/categories';
import type { Product , Category} from '../../types/models';


export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<{ data: Product[] }>(PRODUCTS_API_URL);
    const products = response.data.data || response.data || [];
    return products.map(product => ({
      ...product,
      Hinh: product.Hinh ? product.Hinh : '' 
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get(CATEGORIES_API_URL);
    return response.data; // Hoặc response.data.data
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};


// Hàm lấy sản phẩm theo ID
export const getProductById = async (id: number): Promise<Product> => {
  const response = await axios.get(`${PRODUCTS_API_URL}/${id}`);
  return response.data; // Trả về chi tiết sản phẩm
};


// Thêm headers cho các request upload ảnh
export const createProduct = async (productData: FormData): Promise<Product> => {
  const response = await axios.post(PRODUCTS_API_URL, productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};


export const updateProduct = async (id: number, productData: FormData): Promise<Product> => {
  const response = await axios.put(`${PRODUCTS_API_URL}/${id}`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};


// Hàm xóa sản phẩm theo ID
export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${PRODUCTS_API_URL}/${id}`); // Gửi DELETE request
};

