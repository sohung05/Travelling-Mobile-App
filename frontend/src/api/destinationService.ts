import { Destination, SearchFilters, DestinationCategory } from '../types';
import { HttpClient, API_CONFIG } from './config';
import { mockDestinations } from './mockData';

class DestinationService {
  async getAllDestinations(): Promise<Destination[]> {
    try {
      const result = await HttpClient.get<any[]>(API_CONFIG.ENDPOINTS.DESTINATIONS);
      console.log(`✅ Backend API success: ${result.length} destinations`);
      
      // Transform backend response to frontend format
      const transformedDestinations: Destination[] = result.map((d: any) => ({
        ...d,
        latitude: d.latitude ?? d.location?.latitude,
        longitude: d.longitude ?? d.location?.longitude,
        reviews: d.reviews ?? d.reviewCount ?? 0,
      }));
      
      // Deduplicate by ID to avoid duplicate keys in React
      const destinationsMap = new Map<string, Destination>();
      transformedDestinations.forEach(dest => {
        if (dest.id) {
          // If duplicate ID exists, keep the first one (or override with latest)
          if (!destinationsMap.has(dest.id)) {
            destinationsMap.set(dest.id, dest);
          }
        }
      });
      
      const destinations = Array.from(destinationsMap.values());
      
      if (destinations.length !== transformedDestinations.length) {
        console.warn(`⚠️ Found ${transformedDestinations.length - destinations.length} duplicate destinations, deduplicated to ${destinations.length}`);
      }
      
      console.log(`📊 Sample backend destinations:`, destinations.slice(0, 3).map(d => ({ 
        name: d.name, 
        images: d.images?.length || 0, 
        imageUrl: d.imageUrl,
        latitude: d.latitude,
        longitude: d.longitude,
      })));
      return destinations;
    } catch (error) {
      console.log('🔄 Using fallback mock data for destinations');
      console.log(`📊 Mock data: ${mockDestinations.length} destinations`);
      console.log(`📊 Sample mock destinations:`, mockDestinations.slice(0, 3).map(d => ({ 
        name: d.name, 
        images: d.images?.length || 0, 
        imageUrl: d.imageUrl 
      })));
      // Deduplicate mock data too
      const mockMap = new Map<string, Destination>();
      mockDestinations.forEach(dest => {
        if (dest.id && !mockMap.has(dest.id)) {
          mockMap.set(dest.id, dest);
        }
      });
      return Array.from(mockMap.values());
    }
  }

  async getFeaturedDestinations(): Promise<Destination[]> {
    try {
      const result = await HttpClient.get<any[]>(API_CONFIG.ENDPOINTS.DESTINATIONS_FEATURED);
      // Transform backend response
      return result.map((d: any) => ({
        ...d,
        latitude: d.latitude ?? d.location?.latitude,
        longitude: d.longitude ?? d.location?.longitude,
        reviews: d.reviews ?? d.reviewCount ?? 0,
      }));
    } catch (error) {
      console.log('🔄 Using fallback mock data for featured destinations');
      return mockDestinations.filter(dest => dest.rating >= 4.8).slice(0, 5);
    }
  }

  async getPopularDestinations(): Promise<Destination[]> {
    try {
      const result = await HttpClient.get<any[]>(API_CONFIG.ENDPOINTS.DESTINATIONS_POPULAR);
      // Transform backend response
      return result.map((d: any) => ({
        ...d,
        latitude: d.latitude ?? d.location?.latitude,
        longitude: d.longitude ?? d.location?.longitude,
        reviews: d.reviews ?? d.reviewCount ?? 0,
      }));
    } catch (error) {
      console.log('🔄 Using fallback mock data for popular destinations');
      return mockDestinations.filter(dest => dest.rating >= 4.6).slice(0, 8);
    }
  }

  async getDestinationById(id: string): Promise<Destination | undefined> {
    try {
      const response = await HttpClient.get<any>(`${API_CONFIG.ENDPOINTS.DESTINATIONS}/${id}`);
      
      // Transform backend response to frontend format
      // Backend returns location as object {latitude, longitude}, frontend expects direct properties
      const destination: Destination = {
        ...response,
        latitude: response.latitude ?? response.location?.latitude,
        longitude: response.longitude ?? response.location?.longitude,
        reviews: response.reviews ?? response.reviewCount ?? 0,
      };
      
      return destination;
    } catch (error) {
      console.error('Failed to get destination:', error);
      // Fallback to mock data
      return mockDestinations.find(d => d.id === id);
    }
  }

  async getDestinationsByCategory(category: DestinationCategory): Promise<Destination[]> {
    return HttpClient.get<Destination[]>(`${API_CONFIG.ENDPOINTS.DESTINATIONS_CATEGORY}/${category}`);
  }

  async searchDestinations(filters: SearchFilters): Promise<Destination[]> {
    try {
      // Use backend search endpoint
      if (filters.searchQuery) {
        return HttpClient.get<Destination[]>(`${API_CONFIG.ENDPOINTS.DESTINATIONS_SEARCH}?query=${encodeURIComponent(filters.searchQuery)}`);
      }

      // If no search query, get all destinations and filter client-side for complex filters
      let results = await this.getAllDestinations();

      // Apply additional filters client-side
      if (filters.category) {
        results = results.filter(dest => dest.category === filters.category);
      }

      if (filters.priceRange) {
        results = results.filter(
          dest => dest.price >= filters.priceRange!.min && dest.price <= filters.priceRange!.max
        );
      }

      if (filters.rating) {
        results = results.filter(dest => dest.rating >= filters.rating!);
      }

      if (filters.duration) {
        results = results.filter(dest => dest.duration === filters.duration);
      }

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to client-side search if backend fails
      console.log('🔄 Falling back to client-side search');
      try {
        const allDestinations = await this.getAllDestinations();
        if (filters.searchQuery) {
          return allDestinations.filter(dest => 
            dest.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
            dest.country.toLowerCase().includes(filters.searchQuery!.toLowerCase())
          );
        }
        return allDestinations;
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return [];
      }
    }
  }

  async getRelatedDestinations(destinationId: string): Promise<Destination[]> {
    try {
      const destination = await this.getDestinationById(destinationId);
      if (!destination) return [];

      // Get destinations from same category
      const sameCategory = await this.getDestinationsByCategory(destination.category);
      return sameCategory
        .filter(dest => dest.id !== destinationId)
        .slice(0, 4);
    } catch (error) {
      console.error('Failed to get related destinations:', error);
      return [];
    }
  }

  // Real-time updates: Listen for destination changes
  async subscribeToDestinationUpdates(callback: (destinations: Destination[]) => void): Promise<void> {
    // For now, we'll use polling. In production, use WebSocket or Server-Sent Events
    setInterval(async () => {
      try {
        const destinations = await this.getAllDestinations();
        callback(destinations);
      } catch (error) {
        console.error('Failed to fetch destination updates:', error);
      }
    }, 30000); // Poll every 30 seconds
  }
}

export const destinationService = new DestinationService();


