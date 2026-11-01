import { Review } from '../types';
import { HttpClient, API_CONFIG } from './config';

export interface CreateReviewRequest {
  userId: string;
  destinationId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
  images?: string[];
}

class ReviewService {
  async getReviewsByDestination(destinationId: string): Promise<Review[]> {
    return HttpClient.get<Review[]>(`${API_CONFIG.ENDPOINTS.REVIEWS_DESTINATION}/${destinationId}`);
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return HttpClient.get<Review[]>(`${API_CONFIG.ENDPOINTS.REVIEWS_USER}/${userId}`);
  }

  async getUserReviewForDestination(userId: string, destinationId: string): Promise<Review | null> {
    try {
      return await HttpClient.get<Review>(`${API_CONFIG.ENDPOINTS.REVIEWS_USER}/${userId}/destination/${destinationId}`);
    } catch (error) {
      return null;
    }
  }

  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    return HttpClient.post<Review>(API_CONFIG.ENDPOINTS.REVIEWS, reviewData);
  }

  async updateReview(reviewId: string, reviewData: UpdateReviewRequest): Promise<Review> {
    return HttpClient.put<Review>(`${API_CONFIG.ENDPOINTS.REVIEWS}/${reviewId}`, reviewData);
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      await HttpClient.delete(`${API_CONFIG.ENDPOINTS.REVIEWS}/${reviewId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete review:', error);
      return false;
    }
  }

  async getReviewById(reviewId: string): Promise<Review | undefined> {
    try {
      return await HttpClient.get<Review>(`${API_CONFIG.ENDPOINTS.REVIEWS}/${reviewId}`);
    } catch (error) {
      console.error('Failed to get review:', error);
      return undefined;
    }
  }

  // Real-time updates: Listen for review changes
  async subscribeToReviewUpdates(destinationId: string, callback: (reviews: Review[]) => void): Promise<void> {
    setInterval(async () => {
      try {
        const reviews = await this.getReviewsByDestination(destinationId);
        callback(reviews);
      } catch (error) {
        console.error('Failed to fetch review updates:', error);
      }
    }, 10000); // Poll every 10 seconds for reviews
  }
}

export const reviewService = new ReviewService();
