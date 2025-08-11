// Review API service
const API_BASE_URL = 'http://localhost:3001/api';

// Review types
export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  replies?: Reply[];
}

export interface Reply {
  id: string;
  userId: string;
  reviewId: string;
  parentReplyId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  replies?: Reply[];
}

export interface CreateReviewData {
  vehicleId: string;
  rating: number;
  comment: string;
}

export interface CreateReplyData {
  reviewId: string;
  parentReplyId?: string;
  content: string;
}

// Admin review type
export interface AdminReview {
  id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
  };
  replies?: Reply[];
}

// API functions
export const getVehicleReviews = async (vehicleId: string): Promise<Review[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/vehicle/${vehicleId}`);
    
    if (!response.ok) {
      throw new Error('Yorumlar getirilemedi');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    throw error;
  }
};

export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yorum eklenemedi');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yorum silinemedi');
    }
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    throw error;
  }
};

// Reply sistemi API fonksiyonları

export const createReply = async (replyData: CreateReplyData): Promise<Reply> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews/${replyData.reviewId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reviewId: replyData.reviewId,  // ✅ reviewId eklendi
        content: replyData.content,
        parentReplyId: replyData.parentReplyId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yanıt eklenemedi');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Yanıt ekleme hatası:', error);
    throw error;
  }
};

export const deleteReply = async (replyId: string): Promise<void> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews/replies/${replyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yanıt silinemedi');
    }
  } catch (error) {
    console.error('Yanıt silme hatası:', error);
    throw error;
  }
};

export const getRepliesForReview = async (reviewId: string): Promise<Reply[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`);
    
    if (!response.ok) {
      throw new Error('Yanıtlar getirilemedi');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Yanıtları getirme hatası:', error);
    throw error;
  }
};

// Admin functions
export const getAllReviews = async (): Promise<AdminReview[]> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reviews/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Yorumlar getirilemedi');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Tüm yorumları getirme hatası:', error);
    throw error;
  }
};

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  try {
    // Clerk session'dan token al
    const token = await window.Clerk?.session?.getToken();
    if (!token) {
      throw new Error('Authentication token bulunamadı');
    }
    return token;
  } catch (error) {
    console.error('Token alınamadı:', error);
    throw new Error('Authentication token bulunamadı');
  }
};

