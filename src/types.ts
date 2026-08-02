export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  role: 'student' | 'merchant' | 'visitor' | 'staff';
  phone?: string;
}

export type ProductCategory =
  | 'All'
  | 'Textbooks & Books'
  | 'Electronics & Gadgets'
  | 'Fashion & Clothing'
  | 'Food & Snacks'
  | 'Hostel Essentials'
  | 'Services & Printing';

export interface Product {
  id: string;
  title: string;
  price: number; // In GHS (Ghana Cedis)
  description: string;
  category: ProductCategory;
  image: string;
  sellerName: string;
  sellerContact: string;
  sellerRole: string;
  locationOnCampus: string;
  dateAdded: string;
  condition: 'Brand New' | 'Like New' | 'Fair';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'momo' | 'telecel' | 'at_money' | 'card' | 'cod';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  momoNumber?: string;
  deliveryLocation: string;
  status: 'Completed' | 'Processing';
  createdAt: string;
}

export type BuildingCategory =
  | 'All'
  | 'Academic'
  | 'Hostels'
  | 'Administrative'
  | 'Medical'
  | 'Amenities'
  | 'Sports';

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  code: string;
  description: string;
  x: number; // Map percentage coordinate X (0-100)
  y: number; // Map percentage coordinate Y (0-100)
  image: string;
  openingHours: string;
  facilities: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'clinic_nurse';
  text: string;
  timestamp: string;
  quickActions?: string[];
}

export interface ClinicAppointment {
  id: string;
  studentName: string;
  studentId: string;
  date: string;
  time: string;
  reason: string;
  status: 'Confirmed' | 'Pending';
}

export interface LiveGPSUser {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  speedKmH: number;
  headingDeg: number;
  lastUpdated: string;
  isSelf?: boolean;
}

