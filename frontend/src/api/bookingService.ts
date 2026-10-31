import { Booking, Destination } from '../types';
import { HttpClient, API_CONFIG } from './config';
import { destinationService } from './destinationService';
import { mockBookings } from './mockData';

class BookingService {
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const response = await HttpClient.get<any[]>(`${API_CONFIG.ENDPOINTS.BOOKINGS_USER}/${userId}`);
      
      // Transform backend data to frontend format
      const bookings: Booking[] = [];
      
      for (const booking of response) {
        
        // If destination is null or not fully populated, try to fetch it using destinationId
        let destination = booking.destination;
        
        // Check if destination is null or doesn't have required fields (name, country, etc.)
        const isDestinationValid = destination && 
                                   typeof destination === 'object' && 
                                   destination.name && 
                                   destination.country;
        
        if (!isDestinationValid) {
          // Try to get destinationId from booking
          // Check multiple possible locations for destinationId
          let destinationId: string | null = null;
          
          // 1. Check if destinationId field exists directly in booking
          if ((booking as any).destinationId) {
            destinationId = (booking as any).destinationId;
          }
          // 2. Check if destination is a DBRef object with $id
          else if (booking.destination && typeof booking.destination === 'object') {
            const destObj = booking.destination as any;
            // Handle DBRef format: {"$ref": "destinations", "$id": {"$oid": "..."}}
            if (destObj.$id) {
              if (typeof destObj.$id === 'string') {
                destinationId = destObj.$id;
              } else if (destObj.$id.$oid) {
                destinationId = destObj.$id.$oid;
              } else if (destObj.$id instanceof Object) {
                destinationId = String(destObj.$id);
              }
            } else if (destObj.id) {
              destinationId = destObj.id;
            }
          }
          
          if (destinationId) {
            try {
              destination = await destinationService.getDestinationById(destinationId);
            } catch (error) {
              console.error(`❌ Failed to fetch destination for booking ${booking.id}:`, error);
            }
          } else {
            console.error(`❌ Booking ${booking.id} has no destination and no destinationId found`);
          }
        }
        
        // Handle travelDate - could be string, Date, or LocalDateTime
        let travelDate: Date;
        if (booking.travelDate) {
          if (typeof booking.travelDate === 'string') {
            travelDate = new Date(booking.travelDate);
          } else if (booking.travelDate instanceof Date) {
            travelDate = booking.travelDate;
          } else {
            // Handle LocalDateTime format from Java backend
            travelDate = new Date(booking.travelDate);
          }
        } else {
          // Fallback to current date + 7 days
          travelDate = new Date();
          travelDate.setDate(travelDate.getDate() + 7);
        }
        
        // Calculate return date from duration
        const durationDays = parseInt(destination?.duration?.match(/\d+/)?.[0] || '7');
        const returnDate = new Date(travelDate);
        returnDate.setDate(returnDate.getDate() + durationDays);
        
        // Format dates to dd/mm/yyyy
        const formatDate = (date: Date): string => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };
        
        const transformedBooking: Booking = {
          id: booking.id,
          destination: destination || null,
          userId: booking.userId,
          startDate: travelDate.toISOString(),
          endDate: returnDate.toISOString(),
          departureDate: formatDate(travelDate), // dd/mm/yyyy
          returnDate: formatDate(returnDate), // dd/mm/yyyy
          guests: booking.numberOfTravelers || booking.guests || 1,
          totalPrice: booking.totalPrice ? Number(booking.totalPrice) : 0,
          status: (booking.status?.toLowerCase() || 'pending') as any,
          createdAt: booking.createdAt || booking.bookingDate || new Date().toISOString(),
          paymentMethod: booking.paymentMethod,
          specialRequests: Array.isArray(booking.specialRequests) 
            ? booking.specialRequests.join(', ') 
            : (booking.specialRequests || '')
        };
        
        bookings.push(transformedBooking);
      }
      
      // Filter out bookings without destination (invalid bookings)
      const validBookings = bookings.filter(b => b.destination != null);
      if (validBookings.length < bookings.length) {
        console.warn(`⚠️ Filtered out ${bookings.length - validBookings.length} bookings without destination`);
      }
      
      return validBookings;
    } catch (error) {
      console.log('🔄 Backend chưa khả dụng, trả về danh sách đặt tour mẫu');
      return mockBookings;
    }
  }

  async getBookingById(bookingId: string): Promise<Booking | undefined> {
    try {
      return await HttpClient.get<Booking>(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}`);
    } catch (error) {
      console.error('Failed to get booking:', error);
      return undefined;
    }
  }

  async createBooking(
    destination: Destination,
    userId: string,
    startDate: string,
    endDate: string,
    guests: number,
    specialRequests?: string,
    totalPrice?: number,
    paymentMethod?: string
  ): Promise<Booking> {
    const bookingData = {
      userId: userId,
      destinationId: destination.id,
      travelDate: new Date(startDate).toISOString(),
      numberOfTravelers: guests,
      totalPrice: totalPrice || destination.price,
      paymentMethod: paymentMethod || 'credit_card', // Use actual payment method
      specialRequests: specialRequests || '',
    };

    console.log('📤 Creating booking with data:', bookingData);
    return HttpClient.post<Booking>(API_CONFIG.ENDPOINTS.BOOKINGS, bookingData);
  }

  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      await HttpClient.put(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}/cancel`);
      return true;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      return false;
    }
  }

  async getUpcomingBookings(userId: string): Promise<Booking[]> {
    return HttpClient.get<Booking[]>(`${API_CONFIG.ENDPOINTS.BOOKINGS_UPCOMING}/${userId}/upcoming`);
  }

  async getPastBookings(userId: string): Promise<Booking[]> {
    return HttpClient.get<Booking[]>(`${API_CONFIG.ENDPOINTS.BOOKINGS_COMPLETED}/${userId}/completed`);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    return HttpClient.put<Booking>(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}/status?status=${status}`);
  }

  async updatePaymentStatus(bookingId: string, paymentStatus: string): Promise<Booking> {
    return HttpClient.put<Booking>(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}/payment?paymentStatus=${paymentStatus}`);
  }

  // Real-time updates: Listen for booking changes
  async subscribeToBookingUpdates(userId: string, callback: (bookings: Booking[]) => void): Promise<void> {
    setInterval(async () => {
      try {
        const bookings = await this.getUserBookings(userId);
        callback(bookings);
      } catch (error) {
        console.error('Failed to fetch booking updates:', error);
      }
    }, 15000); // Poll every 15 seconds
  }
}

export const bookingService = new BookingService();


