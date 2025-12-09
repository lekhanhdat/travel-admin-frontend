export interface User {
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface Location {
  Id: number;
  name: string;
  types: string;
  types_display?: string;
  description: string;
  long_description?: string;
  address: string;
  lat: number;
  long: number;
  phone?: string;
  website?: string;
  opening_hours?: string;
  reviews: string;
  calculated_rating?: number;
  review_count?: number;
  images: string;
  images_display?: string;
  videos: string;
  videos_display?: string;
  advise: string;
  advise_display?: string;
  marker: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Festival {
  Id: number;
  name: string;
  types: string;
  types_display?: string;
  description: string;
  event_time: string;
  location: string;
  price_level: number;
  rating?: number;
  calculated_rating?: number;
  review_count?: number;
  reviews: string;
  images: string;
  images_display?: string;
  videos: string;
  videos_display?: string;
  advise: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Account {
  Id: number;
  userName: string;
  email: string;
  fullName: string;
  avatar: string;
  phone: string;
  address: string;
  birthday: string;
  gender: string;
  balance: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface AIObject {
  Id: number;
  title: string;
  content: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Transaction {
  Id: number;
  orderCode: string;
  userName: string;
  fullName: string;
  userDisplay: string;
  amount: number;
  description: string;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  pendingTransactions: number;
}

export interface Review {
  id: string;
  source: 'Location' | 'Festival';
  sourceId: number;
  sourceName: string;
  user: string;
  rating: number;
  comment: string;
  timeReview: string;
  reviewIndex: number;
}

export interface ReviewStats {
  totalReviews: number;
  locationReviews: number;
  festivalReviews: number;
  averageRating: number;
}

export interface FilterOption {
  id: number;
  name: string;
}

export interface PageInfo {
  totalRows: number;
  page: number;
  pageSize: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface PaginatedResponse<T> {
  list: T[];
  pageInfo: PageInfo;
}
