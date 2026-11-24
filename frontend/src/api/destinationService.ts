import { Destination, SearchFilters, DestinationCategory } from '../types';
import { HttpClient, API_CONFIG } from './config';
import { mockDestinations } from './mockData';

class DestinationService {
  private normalizeDestination(d: any): Destination {
    const rawImages = Array.isArray(d?.images) ? d.images.filter(Boolean) : [];
    const imageUrl = d?.imageUrl || rawImages[0] || '';
    const images = imageUrl
      ? [imageUrl, ...rawImages.filter((img: string) => img && img !== imageUrl)]
      : rawImages;
    const rawPrice = d?.price;
    const parsedPrice =
      typeof rawPrice === 'number'
        ? rawPrice
        : typeof rawPrice === 'string'
          ? Number(rawPrice.replace(/[^\d.-]/g, ''))
          : Number(rawPrice);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : (rawPrice ?? 0);

    return {
      ...d,
      id: String(d?.id ?? d?._id ?? ''),
      name: d?.name ?? '',
      country: d?.country ?? d?.location?.country ?? '',
      description: d?.description ?? '',
      shortDescription: d?.shortDescription ?? '',
      imageUrl,
      images,
      rating: typeof d?.rating === 'number' ? d.rating : Number(d?.rating) || 0,
      reviews: typeof d?.reviews === 'number' ? d.reviews : (typeof d?.reviewCount === 'number' ? d.reviewCount : Number(d?.reviewCount) || 0),
      reviewCount: typeof d?.reviewCount === 'number' ? d.reviewCount : (typeof d?.reviews === 'number' ? d.reviews : Number(d?.reviews) || 0),
      price,
      duration: d?.duration ?? '',
      category: d?.category ?? 'Cultural',
      featured: !!d?.featured,
      popular: !!d?.popular,
      latitude: d?.latitude ?? d?.location?.latitude,
      longitude: d?.longitude ?? d?.location?.longitude,
      location: d?.location ?? undefined,
      highlights: Array.isArray(d?.highlights) ? d.highlights : [],
      amenities: Array.isArray(d?.amenities) ? d.amenities : [],
      type: d?.type,
    } as Destination;
  }
  async getAllDestinations(): Promise<Destination[]> {
    try {
      const result = await HttpClient.get<any[]>(API_CONFIG.ENDPOINTS.DESTINATIONS);
      console.log(`✅ Backend API success: ${result.length} destinations`);
      
      // Transform backend response to frontend format
      const transformedDestinations: Destination[] = result.map((d: any) => this.normalizeDestination(d));
      
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
      console.error('❌ Failed to fetch destinations from backend API:', error);
      throw error;
    }
  }

  async getFeaturedDestinations(): Promise<Destination[]> {
    try {
      const result = await HttpClient.get<any[]>(API_CONFIG.ENDPOINTS.DESTINATIONS_FEATURED);
      return result.map((d: any) => this.normalizeDestination(d));
    } catch (error) {
      console.error('❌ Failed to fetch featured destinations from backend API:', error);
      throw error;
    }
  }

  async getPopularDestinations(): Promise<Destination[]> {
    try {
      const result = await HttpClient.get<any[]>(API_CONFIG.ENDPOINTS.DESTINATIONS_POPULAR);
      return result.map((d: any) => this.normalizeDestination(d));
    } catch (error) {
      console.error('❌ Failed to fetch popular destinations from backend API:', error);
      throw error;
    }
  }

  async getDestinationById(id: string): Promise<Destination | undefined> {
    try {
      const response = await HttpClient.get<any>(`${API_CONFIG.ENDPOINTS.DESTINATIONS}/${id}`);
      return this.normalizeDestination(response);
    } catch (error) {
      console.error('❌ Failed to get destination from backend API:', error);
      throw error;
    }
  }

  async getDestinationsByCategory(category: DestinationCategory): Promise<Destination[]> {
    return HttpClient.get<Destination[]>(`${API_CONFIG.ENDPOINTS.DESTINATIONS_CATEGORY}/${category}`);
  }

  async searchDestinations(filters: SearchFilters): Promise<Destination[]> {
    try {
      // Use backend search endpoint
      if (filters.searchQuery) {
        const result = await HttpClient.get<any[]>(`${API_CONFIG.ENDPOINTS.DESTINATIONS_SEARCH}?query=${encodeURIComponent(filters.searchQuery)}`);
        return (result || []).map((d: any) => this.normalizeDestination(d));
      }

      // If no search query, get all destinations and filter client-side for complex filters
      let results = await this.getAllDestinations();

      // Apply additional filters client-side
      if (filters.category) {
        results = results.filter(dest => dest.category === filters.category);
      }

      if (filters.priceRange) {
        results = results.filter((dest) => {
          const price = typeof dest.price === 'number' ? dest.price : Number(String(dest.price ?? '').replace(/[^\d.-]/g, '')) || 0;
          return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
        });
      }

      if (filters.rating) {
        results = results.filter(dest => (dest.rating || 0) >= filters.rating!);
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


