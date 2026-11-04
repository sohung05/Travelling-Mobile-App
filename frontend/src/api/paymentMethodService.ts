import { HttpClient, API_CONFIG } from './config';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  icon?: string;
  iconUrl?: string;
  isActive: boolean;
  isDefault?: boolean;
}

export interface UserPaymentMethod {
  id: string;
  userId: string;
  paymentMethodId: string;
  paymentMethod: PaymentMethod;
  details?: {
    last4?: string;
    cardType?: string;
    expiryDate?: string;
    cardholderName?: string;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  userId: string;
  destinationId: string;
  departureDate?: string;
  returnDate?: string;
  participants?: number;
  services?: string[];
  additionalData?: {
    cvv?: string;
    cardNumber?: string;
    expiryDate?: string;
  };
}

export interface ProcessPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  bookingId?: string;
}

class PaymentMethodService {
  /**
   * Lấy danh sách các phương thức thanh toán có sẵn
   */
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await HttpClient.get<PaymentMethod[]>(API_CONFIG.ENDPOINTS.PAYMENT_METHODS);
      return response;
    } catch (error) {
      console.error('❌ getAvailablePaymentMethods error:', error);
      // Return default payment methods if API fails
      return [
        {
          id: '1',
          name: 'Credit Card',
          type: 'credit_card',
          icon: 'card',
          isActive: true,
        },
        {
          id: '2',
          name: 'PayPal',
          type: 'paypal',
          icon: 'logo-paypal',
          isActive: true,
        },
        {
          id: '3',
          name: 'Apple Pay',
          type: 'apple_pay',
          icon: 'logo-apple',
          isActive: true,
        },
      ];
    }
  }

  /**
   * Lấy các phương thức thanh toán đã lưu của người dùng
   */
  async getUserPaymentMethods(userId: string): Promise<UserPaymentMethod[]> {
    try {
      const response = await HttpClient.get<UserPaymentMethod[]>(
        `${API_CONFIG.ENDPOINTS.PAYMENT_METHODS_USER}/${userId}`
      );
      return response;
    } catch (error: any) {
      // Nếu endpoint chưa được implement, không log lỗi để tránh làm phiền
      if (error?.message?.includes('No static resource') || error?.message?.includes('404')) {
        // Endpoint chưa có, trả về mảng rỗng để frontend hiển thị mẫu
        return [];
      }
      console.error('❌ getUserPaymentMethods error:', error);
      return [];
    }
  }

  /**
   * Thêm phương thức thanh toán mới cho người dùng
   */
  async addUserPaymentMethod(
    userId: string,
    paymentMethodId: string,
    details?: any
  ): Promise<UserPaymentMethod> {
    try {
      const response = await HttpClient.post<UserPaymentMethod>(
        `${API_CONFIG.ENDPOINTS.PAYMENT_METHODS_USER}/${userId}`,
        {
          paymentMethodId,
          details,
        }
      );
      return response;
    } catch (error) {
      console.error('❌ addUserPaymentMethod error:', error);
      throw error;
    }
  }

  /**
   * Đặt phương thức thanh toán làm mặc định
   */
  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      await HttpClient.put(
        `${API_CONFIG.ENDPOINTS.PAYMENT_METHODS_USER}/${userId}/${paymentMethodId}/set-default`
      );
    } catch (error) {
      console.error('❌ setDefaultPaymentMethod error:', error);
      throw error;
    }
  }

  /**
   * Xử lý thanh toán
   */
  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    try {
      // HttpClient automatically unwraps ApiResponse.data
      const response = await HttpClient.post<ProcessPaymentResponse>(
        API_CONFIG.ENDPOINTS.PROCESS_PAYMENT,
        request
      );
      return response;
    } catch (error: any) {
      console.error('❌ processPayment error:', error);
      
      // Temporary mock response for development when backend is not ready
      // Note: This should be removed once backend endpoint is fully implemented
      if (error?.message?.includes('No static resource') || error?.message?.includes('404')) {
        console.warn('⚠️ Backend endpoint not found, please ensure backend is running and endpoint is implemented');
        throw error; // Don't use mock, let the error propagate
      }
      
      throw error;
    }
  }

  /**
   * Xóa phương thức thanh toán của người dùng
   */
  async deleteUserPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      await HttpClient.delete(
        `${API_CONFIG.ENDPOINTS.PAYMENT_METHODS_USER}/${userId}/${paymentMethodId}`
      );
    } catch (error) {
      console.error('❌ deleteUserPaymentMethod error:', error);
      throw error;
    }
  }
}

export const paymentMethodService = new PaymentMethodService();

