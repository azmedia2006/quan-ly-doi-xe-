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

export interface Vehicle {
  id: number;
  plate_number: string;
  model_name: string;
  brand: string;
  vehicle_type: string;
  vehicle_type_display?: string;
  payload_capacity: number;
  fuel_type: string;
  odometer: number;
  registration_expiry?: string;
  insurance_expiry?: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | 'REPAIR' | 'INACTIVE';
  status_display?: string;
  notes?: string;
}

export interface Driver {
  id: number;
  driver_code: string;
  full_name: string;
  phone: string;
  identity_card: string;
  license_number: string;
  license_class: 'B2' | 'C' | 'D' | 'E' | 'FC';
  license_class_display?: string;
  license_expiry?: string;
  experience_years: number;
  rating: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'ON_LEAVE' | 'SUSPENDED';
  status_display?: string;
  avatar_url?: string;
}

export interface TripSchedule {
  id: number;
  trip_code: string;
  vehicle: number;
  vehicle_plate?: string;
  vehicle_model?: string;
  driver: number;
  driver_name?: string;
  driver_phone?: string;
  origin: string;
  destination: string;
  cargo_description: string;
  cargo_weight: number;
  departure_time: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  distance_km: number;
  status: 'PLANNED' | 'DISPATCHED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  status_display?: string;
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

export interface Expense {
  id: number;
  vehicle: number;
  vehicle_plate?: string;
  driver?: number;
  driver_name?: string;
  category: 'FUEL' | 'TOLL' | 'PARKING' | 'POLICE_FINE' | 'OTHER';
  category_display?: string;
  amount: number;
  expense_date: string;
  liters?: number;
  invoice_number?: string;
  notes?: string;
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
