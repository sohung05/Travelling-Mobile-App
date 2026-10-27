// Type definitions for Travelling App

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  category: DestinationCategory;
  featured: boolean;
  popular: boolean;
  latitude?: number;
  longitude?: number;
  highlights: string[];
  amenities: string[];
}

export type DestinationCategory = 
  | 'Beach' 
  | 'Nature' 
  | 'Cultural' 
  | 'Entertainment' 
  | 'Luxury';

export interface Booking {
  id: string;
  destination: Destination;
  userId: string;
  startDate: string;
  endDate: string;
  departureDate: string; // dd/mm/yyyy format
  returnDate: string; // dd/mm/yyyy format
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  paymentMethod?: string;
  specialRequests?: string;
  selectedServices?: string[]; // IDs of selected services
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  favorites: string[]; // destination IDs
  bookings: string[]; // booking IDs
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  destinationId: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}

export interface SearchFilters {
  category?: DestinationCategory;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  duration?: string;
  searchQuery?: string;
}

export interface RootStackParamList {
  [key: string]: any;
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  RegisterSuccess: undefined;
  MainTabs: undefined;
  BookingDetail: { booking: Booking };
  Search: undefined;
  Reviews: { destinationId: string };
  TourServices: { destination: Destination };
  OrderDetails: { orderData?: any } | { destination?: Destination; services?: string[]; departureDate?: string; returnDate?: string; participants?: number; totalPrice?: number };
  ServicePackageDetail: { servicePackage: any };
  PersonalInfo: undefined;
  Security: undefined;
}

export interface MainTabParamList {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Profile: undefined;
}
