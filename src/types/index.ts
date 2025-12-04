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
  rating: number;
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
  email: string;
  fullname: string;
  avatar: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  points: number;
  CreatedAt: string;
  UpdatedAt: string;
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
