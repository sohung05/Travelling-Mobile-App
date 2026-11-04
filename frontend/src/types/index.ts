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
  DestinationDetail: { destination: Destination };
  BookingDetail: { booking: Booking };
  Search: undefined;
  Reviews: { destinationId: string };
  TourServices: { destination: Destination };
  Payment: { destination: Destination; services: string[] };
  PaymentSuccess: { destination: Destination; services: string[] };
  PaymentResult: { success: boolean; message?: string; transactionId?: string; bookingId?: string; orderId: string; destination?: Destination; services?: string[]; departureDate?: string; returnDate?: string; participants?: number; totalPrice?: number; paymentMethod?: string };
  OrderDetails: { orderData?: any } | { destination?: Destination; services?: string[]; departureDate?: string; returnDate?: string; participants?: number; totalPrice?: number };
  PaymentMethods: { destination?: Destination; services?: string[]; departureDate?: string; returnDate?: string; participants?: number; totalPrice?: number; orderId?: string };
  PaymentMethodsProfile: undefined;
  ServicePackageDetail: { servicePackage: any };
  PersonalInfo: undefined;
  Security: undefined;
  ChatBot: undefined;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  suggestedTours?: string[];
}

export interface MainTabParamList {
  [key: string]: any;
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Profile: undefined;
}

