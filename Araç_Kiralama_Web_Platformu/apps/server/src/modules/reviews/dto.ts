// Review DTO'ları

export interface CreateReviewDto {
  vehicleId: string;
  rating: number; // 1-5 arası
  comment: string;
}

export interface ReviewResponseDto {
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
  replies?: ReplyResponseDto[]; // Yanıtlar
}

export interface AdminReviewResponseDto {
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
  replies?: ReplyResponseDto[]; // Yanıtlar
}

// Reply DTO'ları

export interface CreateReplyDto {
  reviewId: string;
  parentReplyId?: string | null; // null değerleri kabul ediyor
  content: string;
}

export interface ReplyResponseDto {
  id: string;
  userId: string;
  reviewId: string;
  parentReplyId: string | null; // null değerleri kabul ediyor
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  replies?: ReplyResponseDto[]; // Nested replies
}

