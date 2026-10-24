export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'DISPATCHER'
  | 'DRIVER'
  | 'MECHANIC'
  | 'ACCOUNTANT';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  role_display: string;
  phone_number?: string;
  avatar?: string;
  address?: string;
}

// // UPDATE: Quản lý xe - Thêm loại xe (tải, khách, con), năm sản xuất, định mức nhiên liệu lý thuyết
export interface Vehicle {
  id: number;
  plate_number: string;
  model_name: string;
  brand: string;
  vehicle_type: 'TRUCK' | 'PASSENGER' | 'CAR' | 'CONTAINER' | 'VAN';
  vehicle_type_display?: string;
  payload_capacity: number;
  manufacture_year: number; // // NEW
  fuel_consumption_rate: number; // // NEW (Lít/100km)
  fuel_type: string;
  odometer: number;
  registration_expiry?: string;
  insurance_expiry?: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | 'REPAIR' | 'INACTIVE';
  status_display?: string;
  notes?: string;
}

// // UPDATE: Quản lý tài xế - Thông tin cá nhân, ngày cấp/hết hạn bằng, 3 trạng thái
export interface Driver {
  id: number;
  driver_code: string;
  full_name: string;
  phone: string;
  identity_card: string;
  date_of_birth?: string; // // NEW
  address?: string; // // NEW
  license_number: string;
  license_class: string;
  license_issued_date?: string; // // NEW: Ngày cấp bằng
  license_expiry?: string; // // UPDATE: Ngày hết hạn bằng
  experience_years: number;
  rating: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'ON_LEAVE'; // // UPDATE: Đang rảnh / Đang lái / Nghỉ phép
  status_display?: string;
  avatar_url?: string;
}

// // UPDATE: Lệnh điều xe & Chuyến đi - lộ trình dự kiến, hàng hóa/hành khách
export interface TripSchedule {
  id: number;
  trip_code: string;
  vehicle: number;
  vehicle_plate?: string;
  vehicle_model?: string;
  vehicle_type_display?: string;
  driver: number;
  driver_name?: string;
  driver_phone?: string;
  driver_license?: string;
  origin: string;
  destination: string;
  route_details?: string; // // NEW: Lộ trình dự kiến
  cargo_or_passenger_info: string; // // UPDATE: Hàng hóa / Hành khách
  cargo_weight: number;
  departure_time: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  distance_km: number;
  status: 'PLANNED' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  status_display?: string;
  notes?: string;
}

// // UPDATE: Chi phí & Xăng dầu - 4 nhóm: Hóa đơn xăng dầu, phí BOT, sửa chữa, vé phạt
export interface Expense {
  id: number;
  vehicle: number;
  vehicle_plate?: string;
  vehicle_model?: string;
  driver?: number;
  driver_name?: string;
  category: 'FUEL' | 'TOLL' | 'REPAIR' | 'FINE' | 'OTHER';
  category_display?: string;
  amount: number;
  expense_date: string;
  liters?: number;
  fuel_price_per_liter?: number; // // NEW
  invoice_number?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: number;
  maintenance_code: string;
  vehicle: number;
  vehicle_plate?: string;
  vehicle_model?: string;
  service_type: string;
  service_type_display?: string;
  odometer_at_service: number;
  service_date: string;
  garage_name: string;
  cost: number;
  details: string;
  technician_name?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_display?: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  vehicle: number;
  vehicle_plate?: string;
  driver?: number;
  driver_name?: string;
  incident_date: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  severity_display?: string;
  description: string;
  insurance_claim_amount: number;
  status: 'REPORTED' | 'PROCESSING' | 'RESOLVED';
  status_display?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  time_ago?: string;
}
