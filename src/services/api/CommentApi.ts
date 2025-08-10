import axios from 'axios';

const COMMENT_API_URL = 'http://localhost:3000/api/comment';

import type {Comment} from '../../types/models';


export const getComments = async (): Promise<Comment[]> => {
  try {
    const response = await axios.get(`${COMMENT_API_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const approveComment = async (id: number): Promise<void> => {
  try {
    await axios.put(`${COMMENT_API_URL}/${id}/approve`);
  } catch (error) {
    console.error("Error approving comment:", error);
    throw error;
  }
};
export const createComment = async (commentData: {
  SoSao: number;
  BinhLuan: string;
  MaSanPham: number;
}): Promise<void> => {
  try {
    await axios.post(`${COMMENT_API_URL}`, commentData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};
export const rejectComment = async (id: number): Promise<void> => {
  try {
    await axios.put(`${COMMENT_API_URL}/${id}/reject`);
  } catch (error) {
    console.error("Error rejecting comment:", error);
    throw error;
  }
};

export const deleteComment = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${COMMENT_API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};